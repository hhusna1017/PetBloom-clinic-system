from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import (
    Appointment, Payment, Pet, PetOwner, Staff, Treatment, Veterinarian,
)
from .serializers import (
    AppointmentSerializer, LoginSerializer, PaymentSerializer,
    PetOwnerSerializer, PetSerializer, StaffSerializer,
    TreatmentSerializer, VeterinarianSerializer,
)


# ---------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------
def owner_of(user):
    return getattr(user, "owner_profile", None)


def vet_of(user):
    return getattr(user, "vet_profile", None)


def staff_of(user):
    return getattr(user, "staff_profile", None)


def require_staff(user, message="Only staff can do this."):
    if staff_of(user) is None:
        raise PermissionDenied(message)


class NoVetWrites(permissions.BasePermission):
    """Vets may read but not create, edit or delete."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return vet_of(request.user) is None


class RegisterOpenElseLoggedIn(permissions.BasePermission):
    """Anyone may register (POST create); everything else needs a login."""

    def has_permission(self, request, view):
        if getattr(view, "action", None) == "create":
            return True
        return bool(request.user and request.user.is_authenticated)


# ---------------------------------------------------------------
# Owners
# ---------------------------------------------------------------
class PetOwnerViewSet(viewsets.ModelViewSet):
    queryset = PetOwner.objects.all().order_by("id")
    serializer_class = PetOwnerSerializer
    permission_classes = [RegisterOpenElseLoggedIn]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return PetOwner.objects.none()
        user = self.request.user
        qs = PetOwner.objects.all().order_by("id")
        owner = owner_of(user)
        if owner is not None:
            return qs.filter(pk=owner.pk)
        if staff_of(user) is not None:
            return qs
        vet = vet_of(user)
        if vet is not None:
            return qs.filter(appointments__vet=vet).distinct()
        return qs.none()

    def perform_update(self, serializer):
        if vet_of(self.request.user) is not None:
            raise PermissionDenied("Vets cannot edit owners.")
        serializer.save()

    def perform_destroy(self, instance):
        require_staff(self.request.user, "Only staff can delete owners.")
        instance.delete()


# ---------------------------------------------------------------
# Pets
# ---------------------------------------------------------------
class PetViewSet(viewsets.ModelViewSet):
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated, NoVetWrites]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Pet.objects.none()
        user = self.request.user
        owner = owner_of(user)
        if owner is not None:
            return Pet.objects.filter(owner=owner).order_by("id")
        if staff_of(user) is not None or vet_of(user) is not None:
            return Pet.objects.all().order_by("id")
        return Pet.objects.none()

    def perform_create(self, serializer):
        owner = owner_of(self.request.user)
        if owner is not None:
            serializer.save(owner=owner)
        elif serializer.validated_data.get("owner") is not None:
            serializer.save()
        else:
            raise ValidationError({"owner": "This field is required."})

    def perform_update(self, serializer):
        owner = owner_of(self.request.user)
        if owner is not None:
            serializer.save(owner=owner)
        else:
            serializer.save()


# ---------------------------------------------------------------
# Vets and staff
# ---------------------------------------------------------------
class VeterinarianViewSet(viewsets.ModelViewSet):
    queryset = Veterinarian.objects.all().order_by("id")
    serializer_class = VeterinarianSerializer
    permission_classes = [RegisterOpenElseLoggedIn]

    def perform_update(self, serializer):
        require_staff(self.request.user, "Only staff can edit vets.")
        serializer.save()

    def perform_destroy(self, instance):
        require_staff(self.request.user, "Only staff can delete vets.")
        instance.delete()


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().order_by("id")
    serializer_class = StaffSerializer
    permission_classes = [RegisterOpenElseLoggedIn]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Staff.objects.none()
        if staff_of(self.request.user) is not None:
            return Staff.objects.all().order_by("id")
        return Staff.objects.none()


# ---------------------------------------------------------------
# Appointments
# ---------------------------------------------------------------
class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Appointment.objects.none()
        user = self.request.user
        qs = Appointment.objects.select_related("pet", "vet").order_by(
            "-date", "-time", "-id"
        )
        owner = owner_of(user)
        if owner is not None:
            return qs.filter(owner=owner)
        vet = vet_of(user)
        if vet is not None:
            return qs.filter(vet=vet)
        if staff_of(user) is not None:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        owner = owner_of(user)
        staff = staff_of(user)
        if owner is not None:
            serializer.save(owner=owner, status="pending")
        elif serializer.validated_data.get("owner") is not None:
            if staff is not None:
                serializer.save(staff=staff)
            else:
                serializer.save()
        else:
            raise ValidationError({"owner": "This field is required."})

    def perform_update(self, serializer):
        staff = staff_of(self.request.user)
        if staff is not None:
            serializer.save(staff=staff)
        else:
            serializer.save()

    def perform_destroy(self, instance):
        require_staff(self.request.user, "Only staff can delete appointments.")
        instance.delete()


# ---------------------------------------------------------------
# Treatments
# ---------------------------------------------------------------
class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.all().order_by("id")
    serializer_class = TreatmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Treatment.objects.none()
        user = self.request.user
        qs = Treatment.objects.all().order_by("id")
        owner = owner_of(user)
        if owner is not None:
            return qs.filter(appointment__owner=owner)
        vet = vet_of(user)
        if vet is not None:
            return qs.filter(vet=vet)
        if staff_of(user) is not None:
            return qs
        return qs.none()

    def _save(self, serializer):
        user = self.request.user
        vet = vet_of(user)
        if vet is not None:
            serializer.save(vet=vet)
        elif staff_of(user) is not None:
            serializer.save()
        else:
            raise PermissionDenied("Only staff or vets can change treatments.")

    def perform_create(self, serializer):
        self._save(serializer)

    def perform_update(self, serializer):
        self._save(serializer)

    def perform_destroy(self, instance):
        require_staff(self.request.user, "Only staff can delete treatments.")
        instance.delete()


# ---------------------------------------------------------------
# Payments
# ---------------------------------------------------------------
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by("id")
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Payment.objects.none()
        user = self.request.user
        qs = Payment.objects.all().order_by("id")
        owner = owner_of(user)
        if owner is not None:
            return qs.filter(treatment__appointment__owner=owner)
        vet = vet_of(user)
        if vet is not None:
            return qs.filter(treatment__vet=vet)
        if staff_of(user) is not None:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        treatment = serializer.validated_data["treatment"]

        if Payment.objects.filter(treatment=treatment).exists():
            raise ValidationError(
                {"treatment": "This treatment has already been paid."}
            )

        owner = owner_of(user)
        staff = staff_of(user)

        if owner is not None:
            # Owner pays by scanning the clinic QR. The server sets the amount;
            # staff must verify the transfer before it counts as paid.
            if treatment.appointment.owner_id != owner.id:
                raise PermissionDenied("You can only pay for your own treatments.")
            reference_no = (serializer.validated_data.get("reference_no") or "").strip()
            if not reference_no:
                raise ValidationError(
                    {"reference_no": "Please enter the transaction reference number."}
                )
            serializer.save(
                amount=treatment.medication_cost + treatment.treatment_cost,
                method="online",
                staff=None,
                status="pending_verification",
                reference_no=reference_no,
            )
        elif staff is not None:
            serializer.save(staff=staff, status="paid")
        else:
            raise PermissionDenied("Only staff or owners can record payments.")

    def perform_update(self, serializer):
        staff = staff_of(self.request.user)
        if staff is None:
            raise PermissionDenied("Only staff can edit payments.")
        serializer.save(staff=staff)

    def perform_destroy(self, instance):
        require_staff(self.request.user, "Only staff can delete payments.")
        instance.delete()


# ---------------------------------------------------------------
# Login
# ---------------------------------------------------------------
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.validated_data["role"]
        identifier = serializer.validated_data["identifier"].strip()
        password = serializer.validated_data["password"]

        if role == "owner":
            username = identifier.lower()
        else:
            username = f"{role}{identifier}"

        user = authenticate(username=username, password=password)
        profile = getattr(user, f"{role}_profile", None) if user else None

        if profile is None:
            return Response(
                {"detail": "Invalid ID or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "role": role,
            "id": profile.id,
            "name": profile.name,
        })
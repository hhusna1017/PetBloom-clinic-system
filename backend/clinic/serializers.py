from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import (
    Appointment, Payment, Pet, PetOwner, Staff, Treatment, Veterinarian,
)

User = get_user_model()


class AccountMixin:
    """Create a login account when a password is supplied at registration."""

    def make_username(self, instance):
        raise NotImplementedError

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        with transaction.atomic():
            instance = super().create(validated_data)
            if password:
                user = User.objects.create_user(
                    username=self.make_username(instance),
                    password=password,
                )
                instance.user = user
                instance.save(update_fields=["user"])
        return instance


class PetOwnerSerializer(AccountMixin, serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = PetOwner
        fields = ["id", "name", "email", "contact_no", "address", "password"]

    def make_username(self, instance):
        return instance.email.lower()

    def validate_email(self, value):
        if self.instance is not None:
            # E-mel ialah nama login, jadi tak boleh ditukar selepas daftar.
            if value.lower() != self.instance.email.lower():
                raise serializers.ValidationError(
                    "Email cannot be changed after registration."
                )
            return value
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value


class PetSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        queryset=PetOwner.objects.all(), required=False
    )

    class Meta:
        model = Pet
        fields = ["id", "owner", "name", "species", "breed", "age", "age_unit"]


class VeterinarianSerializer(AccountMixin, serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = Veterinarian
        fields = ["id", "name", "specialization", "phone_no",
                  "work_days", "work_shift", "password"]

    def make_username(self, instance):
        return f"vet{instance.id}"


class StaffSerializer(AccountMixin, serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = Staff
        fields = ["id", "name", "phone_no", "role", "password"]

    def make_username(self, instance):
        return f"staff{instance.id}"


class AppointmentSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        queryset=PetOwner.objects.all(), required=False
    )
    pet_name = serializers.SerializerMethodField()
    vet_name = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ["id", "date", "time", "status", "treatment_name",
                  "treatment_cost", "owner", "pet", "vet", "staff",
                  "pet_name", "vet_name", "payment_method"]

    def get_pet_name(self, obj) -> str:
        return obj.pet.name

    def get_vet_name(self, obj) -> str | None:
        return obj.vet.name if obj.vet else None

    def get_payment_method(self, obj) -> str:
        payment = (
            Payment.objects.filter(treatment__appointment=obj)
            .order_by("-id").first()
        )
        return payment.get_method_display() if payment else "Pending"

    def validate(self, data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        owner_profile = getattr(user, "owner_profile", None)

        if owner_profile is not None:
            if self.instance is not None:
                only_status = set(self.initial_data.keys()) <= {"status"}
                if not only_status or data.get("status") != "cancelled":
                    raise serializers.ValidationError(
                        "Owners can only cancel their own appointments."
                    )
                return data
            owner = owner_profile
        else:
            owner = data.get("owner", getattr(self.instance, "owner", None))

        pet = data.get("pet", getattr(self.instance, "pet", None))
        if pet and owner and pet.owner_id != owner.id:
            raise serializers.ValidationError(
                "This pet does not belong to the selected owner."
            )
        return data


class TreatmentSerializer(serializers.ModelSerializer):
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Treatment
        fields = ["id", "description", "medication_cost", "treatment_cost",
                  "total_cost", "vet", "pet", "appointment",
                  "medication_name", "notes"]

    def get_total_cost(self, obj) -> str:
        return str(obj.medication_cost + obj.treatment_cost)

    def validate(self, data):
        appointment = data.get(
            "appointment", getattr(self.instance, "appointment", None)
        )
        pet = data.get("pet", getattr(self.instance, "pet", None))
        if appointment and pet and appointment.pet_id != pet.id:
            raise serializers.ValidationError(
                "This appointment is not for the selected pet."
            )
        return data


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "amount", "payment_date", "method",
                  "staff", "treatment", "status", "reference_no"]
        read_only_fields = ["staff"]

class LoginSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["owner", "vet", "staff"])
    identifier = serializers.CharField()
    password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
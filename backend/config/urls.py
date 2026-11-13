from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView, SpectacularSwaggerView,
)
from rest_framework.routers import DefaultRouter

from clinic.views import (
    AppointmentViewSet, LoginView, PaymentViewSet, PetOwnerViewSet,
    PetViewSet, StaffViewSet, TreatmentViewSet, VeterinarianViewSet,
)

router = DefaultRouter()
router.register("owners", PetOwnerViewSet, basename="owner")
router.register("pets", PetViewSet, basename="pet")
router.register("vets", VeterinarianViewSet, basename="vet")
router.register("staff", StaffViewSet, basename="staff")
router.register("appointments", AppointmentViewSet, basename="appointment")
router.register("treatments", TreatmentViewSet, basename="treatment")
router.register("payments", PaymentViewSet, basename="payment")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(
        url_name="schema"), name="swagger-ui"),
]
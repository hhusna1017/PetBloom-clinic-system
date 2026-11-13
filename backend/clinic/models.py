from django.conf import settings
from django.db import models

class PetOwner(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    contact_no = models.CharField(max_length=20)
    address = models.CharField(max_length=255, blank=True, default="")
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="owner_profile",
    )

    def __str__(self):
        return self.name


class Pet(models.Model):
    owner = models.ForeignKey(
        PetOwner, on_delete=models.CASCADE, related_name="pets"
    )
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=50)
    breed = models.CharField(max_length=100, blank=True)
    age = models.PositiveIntegerField()
    age_unit = models.CharField(
        max_length=10,
        choices=[("Years", "Years"), ("Months", "Months")],
        default="Years",
    )

    def __str__(self):
        return self.name

class Veterinarian(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    phone_no = models.CharField(max_length=20)
    work_days = models.CharField(max_length=100, blank=True, default="")
    work_shift = models.CharField(max_length=20, blank=True, default="")
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="vet_profile",
    )

    def __str__(self):
        return self.name


class Staff(models.Model):
    name = models.CharField(max_length=100)
    phone_no = models.CharField(max_length=20)
    role = models.CharField(max_length=50)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="staff_profile",
    )

    def __str__(self):
        return self.name

class Appointment(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    treatment_name = models.CharField(max_length=150, blank=True, default="")
    treatment_cost = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    owner = models.ForeignKey(
        PetOwner, on_delete=models.CASCADE, related_name="appointments"
    )
    pet = models.ForeignKey(
        Pet, on_delete=models.CASCADE, related_name="appointments"
    )
    vet = models.ForeignKey(
        Veterinarian, on_delete=models.PROTECT,
        null=True, blank=True, related_name="appointments",
    )
    staff = models.ForeignKey(
        Staff, on_delete=models.PROTECT,
        null=True, blank=True, related_name="appointments",
    )

    def __str__(self):
        return f"{self.pet} on {self.date} {self.time}"
        
class Treatment(models.Model):
    description = models.TextField()
    medication_cost = models.DecimalField(max_digits=8, decimal_places=2)
    treatment_cost = models.DecimalField(max_digits=8, decimal_places=2)
    medication_name = models.CharField(max_length=150, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    vet = models.ForeignKey(
        Veterinarian, on_delete=models.PROTECT, related_name="treatments"
    )
    pet = models.ForeignKey(
        Pet, on_delete=models.CASCADE, related_name="treatments"
    )
    appointment = models.ForeignKey(
        Appointment, on_delete=models.CASCADE, related_name="treatments"
    )

    def __str__(self):
        return f"Treatment {self.pk} for {self.pet}"


class Payment(models.Model):
    METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("online", "Online transfer"),
    ]

    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_date = models.DateField()
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    staff = models.ForeignKey(
           Staff, on_delete=models.PROTECT, related_name="payments",
           null=True, blank=True,
    )
    treatment = models.ForeignKey(
        Treatment, on_delete=models.CASCADE, related_name="payments"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending_verification", "Pending verification"),
            ("paid", "Paid"),
        ],
        default="paid",
    )
    reference_no = models.CharField(max_length=100, blank=True, default="")

    medication_name = models.CharField(max_length=150, blank=True, default="")
    notes = models.TextField(blank=True, default="")

    def __str__(self):
        return f"Payment {self.pk}: {self.amount}"
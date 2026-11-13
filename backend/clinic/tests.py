from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import (
    Appointment, Payment, Pet, PetOwner, Staff, Treatment, Veterinarian,
)

User = get_user_model()
PASSWORD = "Test1234!"


class Base(APITestCase):
    """Cipta data contoh: 2 owner, 2 vet, 1 staff, 1 temujanji + 1 rawatan untuk owner A."""

    def setUp(self):
        # Owner A dan B (username = email huruf kecil)
        self.user_a = User.objects.create_user("a@test.com", password=PASSWORD)
        self.owner_a = PetOwner.objects.create(
            name="Owner A", email="a@test.com", contact_no="011", user=self.user_a
        )
        self.user_b = User.objects.create_user("b@test.com", password=PASSWORD)
        self.owner_b = PetOwner.objects.create(
            name="Owner B", email="b@test.com", contact_no="012", user=self.user_b
        )

        self.pet_a = Pet.objects.create(owner=self.owner_a, name="Mimi", species="Cat", age=2)
        self.pet_b = Pet.objects.create(owner=self.owner_b, name="Boby", species="Dog", age=3)

        # Vet & staff: username = role + id
        self.vet1 = Veterinarian.objects.create(name="Vet One", specialization="General", phone_no="013")
        self.vet1.user = User.objects.create_user(f"vet{self.vet1.id}", password=PASSWORD)
        self.vet1.save()
        self.vet2 = Veterinarian.objects.create(name="Vet Two", specialization="Surgery", phone_no="014")
        self.vet2.user = User.objects.create_user(f"vet{self.vet2.id}", password=PASSWORD)
        self.vet2.save()

        self.staff = Staff.objects.create(name="Staff One", phone_no="015", role="Receptionist")
        self.staff.user = User.objects.create_user(f"staff{self.staff.id}", password=PASSWORD)
        self.staff.save()

        self.appt_a = Appointment.objects.create(
            date="2026-11-12", time="10:00", status="approved",
            owner=self.owner_a, pet=self.pet_a, vet=self.vet1,
        )
        self.appt_b = Appointment.objects.create(
            date="2026-11-12", time="11:00", status="approved",
            owner=self.owner_b, pet=self.pet_b, vet=self.vet2,
        )
        self.treatment_a = Treatment.objects.create(
            description="Check-up", medication_cost=Decimal("25.00"),
            treatment_cost=Decimal("30.00"), vet=self.vet1,
            pet=self.pet_a, appointment=self.appt_a,
        )

    def as_owner_a(self):
        self.client.force_authenticate(self.user_a)

    def as_vet1(self):
        self.client.force_authenticate(self.vet1.user)

    def as_staff(self):
        self.client.force_authenticate(self.staff.user)


class LoginTests(Base):
    def login(self, role, identifier, password=PASSWORD):
        return self.client.post(
            "/api/auth/login/",
            {"role": role, "identifier": identifier, "password": password},
            format="json",
        )

    def test_owner_login_ok(self):
        r = self.login("owner", "A@Test.com")  # huruf besar pun boleh
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["role"], "owner")
        self.assertIn("token", r.data)

    def test_vet_login_ok(self):
        r = self.login("vet", str(self.vet1.id))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["id"], self.vet1.id)

    def test_staff_login_ok(self):
        r = self.login("staff", str(self.staff.id))
        self.assertEqual(r.status_code, 200)

    def test_wrong_password(self):
        self.assertEqual(self.login("owner", "a@test.com", "salah").status_code, 401)

    def test_wrong_role(self):
        # akaun vet tak boleh login sebagai staff
        self.assertEqual(self.login("staff", str(self.vet1.id)).status_code, 401)


class AccessTests(Base):
    def test_anonymous_blocked(self):
        for path in ["pets", "appointments", "treatments", "payments", "owners", "staff"]:
            r = self.client.get(f"/api/{path}/")
            self.assertEqual(r.status_code, 401, path)

    def test_owner_sees_only_own_data(self):
        self.as_owner_a()
        pets = self.client.get("/api/pets/").data["results"]
        self.assertEqual([p["id"] for p in pets], [self.pet_a.id])
        appts = self.client.get("/api/appointments/").data["results"]
        self.assertEqual([a["id"] for a in appts], [self.appt_a.id])
        owners = self.client.get("/api/owners/").data["results"]
        self.assertEqual([o["id"] for o in owners], [self.owner_a.id])

    def test_owner_cannot_open_other_owner(self):
        self.as_owner_a()
        self.assertEqual(self.client.get(f"/api/owners/{self.owner_b.id}/").status_code, 404)
        self.assertEqual(self.client.get(f"/api/appointments/{self.appt_b.id}/").status_code, 404)

    def test_vet_sees_only_own_appointments(self):
        self.as_vet1()
        appts = self.client.get("/api/appointments/").data["results"]
        self.assertEqual([a["id"] for a in appts], [self.appt_a.id])

    def test_vet_cannot_create_pet(self):
        self.as_vet1()
        r = self.client.post(
            "/api/pets/",
            {"owner": self.owner_a.id, "name": "X", "species": "Cat", "age": 1, "age_unit": "Years"},
            format="json",
        )
        self.assertEqual(r.status_code, 403)

    def test_staff_sees_everything(self):
        self.as_staff()
        appts = self.client.get("/api/appointments/").data["results"]
        self.assertEqual(len(appts), 2)

    def test_only_staff_can_delete_appointment(self):
        self.as_owner_a()
        self.assertEqual(self.client.delete(f"/api/appointments/{self.appt_a.id}/").status_code, 403)
        self.as_vet1()
        self.assertEqual(self.client.delete(f"/api/appointments/{self.appt_a.id}/").status_code, 403)
        self.as_staff()
        self.assertEqual(self.client.delete(f"/api/appointments/{self.appt_a.id}/").status_code, 204)

    def test_registration_is_open(self):
        # POST create tidak perlu login (jangan 401/403)
        r = self.client.post(
            "/api/owners/",
            {"name": "New", "email": "new@test.com", "contact_no": "010", "password": PASSWORD},
            format="json",
        )
        self.assertNotIn(r.status_code, (401, 403))


class TreatmentTests(Base):
    def payload(self):
        return {
            "appointment": self.appt_a.id,
            "pet": self.pet_a.id,
            "vet": self.vet2.id,  # cuba palsukan vet; server mesti guna vet yang login
            "description": "Consultation",
            "notes": "ok",
            "medication_name": "Vitamin B",
            "medication_cost": "25.00",
            "treatment_cost": "30.00",
        }

    def test_vet_can_create_and_vet_is_forced(self):
        self.as_vet1()
        r = self.client.post("/api/treatments/", self.payload(), format="json")
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(Treatment.objects.get(pk=r.data["id"]).vet_id, self.vet1.id)

    def test_owner_cannot_create_treatment(self):
        self.as_owner_a()
        r = self.client.post("/api/treatments/", self.payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_owner_sees_only_own_treatments(self):
        other = Treatment.objects.create(
            description="Other", medication_cost=1, treatment_cost=1,
            vet=self.vet2, pet=self.pet_b, appointment=self.appt_b,
        )
        self.as_owner_a()
        ids = [t["id"] for t in self.client.get("/api/treatments/").data["results"]]
        self.assertIn(self.treatment_a.id, ids)
        self.assertNotIn(other.id, ids)


class PaymentTests(Base):
    def test_owner_pays_own_treatment_server_sets_amount(self):
        self.as_owner_a()
        r = self.client.post(
            "/api/payments/",
            {"treatment": self.treatment_a.id, "amount": "1.00",
             "payment_date": "2026-11-10", "method": "cash",
             "reference_no": "REF123", "status": "paid"},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.data)
        p = Payment.objects.get(pk=r.data["id"])
        self.assertEqual(p.amount, Decimal("55.00"))  # 25 + 30, bukan 1.00
        self.assertEqual(p.method, "online")
        self.assertIsNone(p.staff)
        self.assertEqual(p.status, "pending_verification")  # owner tak boleh set 'paid'
        self.assertEqual(p.reference_no, "REF123")

    def test_cannot_pay_twice(self):
        self.as_owner_a()
        data = {"treatment": self.treatment_a.id, "amount": "55.00",
                "payment_date": "2026-11-10", "method": "online",
                "reference_no": "REF123"}
        self.assertEqual(self.client.post("/api/payments/", data, format="json").status_code, 201)
        self.assertEqual(self.client.post("/api/payments/", data, format="json").status_code, 400)

    def test_owner_cannot_pay_for_other_owner(self):
        other = Treatment.objects.create(
            description="Other", medication_cost=1, treatment_cost=1,
            vet=self.vet2, pet=self.pet_b, appointment=self.appt_b,
        )
        self.as_owner_a()
        r = self.client.post(
            "/api/payments/",
            {"treatment": other.id, "amount": "2.00",
             "payment_date": "2026-11-10", "method": "online"},
            format="json",
        )
        self.assertEqual(r.status_code, 403)

    def test_staff_records_payment_with_own_staff_id(self):
        self.as_staff()
        r = self.client.post(
            "/api/payments/",
            {"treatment": self.treatment_a.id, "amount": "55.00",
             "payment_date": "2026-11-10", "method": "cash"},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.data)
        p = Payment.objects.get(pk=r.data["id"])
        self.assertEqual(p.staff_id, self.staff.id)
        self.assertEqual(p.status, "paid")

    def test_vet_cannot_record_payment(self):
        self.as_vet1()
        r = self.client.post(
            "/api/payments/",
            {"treatment": self.treatment_a.id, "amount": "55.00",
             "payment_date": "2026-11-10", "method": "cash"},
            format="json",
        )
        self.assertEqual(r.status_code, 403)

    def test_owner_cannot_delete_payment(self):
        pay = Payment.objects.create(
            amount=55, payment_date="2026-11-10", method="online",
            staff=None, treatment=self.treatment_a,
        )
        self.as_owner_a()
        self.assertEqual(self.client.delete(f"/api/payments/{pay.id}/").status_code, 403)

    def test_owner_must_give_reference_no(self):
        self.as_owner_a()
        r = self.client.post(
            "/api/payments/",
            {"treatment": self.treatment_a.id, "amount": "55.00",
             "payment_date": "2026-11-10", "method": "online"},
            format="json",
        )
        self.assertEqual(r.status_code, 400)
        self.assertFalse(Payment.objects.exists())

    def test_staff_can_confirm_pending_payment(self):
        pay = Payment.objects.create(
            amount=55, payment_date="2026-11-10", method="online",
            staff=None, treatment=self.treatment_a,
            status="pending_verification", reference_no="REF123",
        )
        self.as_staff()
        r = self.client.patch(f"/api/payments/{pay.id}/", {"status": "paid"}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        pay.refresh_from_db()
        self.assertEqual(pay.status, "paid")
        self.assertEqual(pay.staff_id, self.staff.id)

    def test_owner_cannot_confirm_own_payment(self):
        pay = Payment.objects.create(
            amount=55, payment_date="2026-11-10", method="online",
            staff=None, treatment=self.treatment_a,
            status="pending_verification", reference_no="REF123",
        )
        self.as_owner_a()
        r = self.client.patch(f"/api/payments/{pay.id}/", {"status": "paid"}, format="json")
        self.assertEqual(r.status_code, 403)
        pay.refresh_from_db()
        self.assertEqual(pay.status, "pending_verification")
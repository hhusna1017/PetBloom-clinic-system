# Backend

Django REST Framework API for PetBloom Clinic System. Database: SQLite through the Django ORM.

Planned apps: users (owner, staff, veterinarian), pets, appointments with a mock booking check.

## Setup

To be completed on Day 2 once the Django project is scaffolded.

```
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
python manage.py test
```

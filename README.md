# PetBloom-clinic-system

The PetBloom Clinic System is a web-based system developed for PetBloom Clinic to improve the management of veterinary services and streamline clinic operations. It provides a digital platform for pet owners to register themselves and their pets, book appointments and view appointment details.

**Prepared by:** Eisya and Husna

## Vision

A secure web-based system that replaces paper-based clinic processes, so pet owners, staff and veterinarians can manage pets, appointments, treatments and payments in one place, each with the access their role needs.

## Objectives

1. Let pet owners book, modify and cancel appointments easily.
2. Let veterinarians retrieve patient records, view upcoming appointments and organise their schedule.
3. Let pet owners see their pet's diagnoses and treatment summary.
4. Reduce missed appointments with reminders.
5. Let clinic staff manage client registration, basic billing and records in one system.

## Roles

| Role | Can do |
| --- | --- |
| Pet owner | Register, log in, register pets, book appointments, view own appointments and diagnosis summaries |
| General staff | Manage client registration and appointments, record basic billing, send reminders |
| Veterinarian | View patient records, record diagnoses and prescriptions, update treatment plans |

## Scope and limitations

- Web only. There is no mobile app.
- No integration with other clinics or external systems.
- No paid services or API keys. The booking check is a local, deterministic mock.
- Out of scope: file uploads, advanced dashboards, email or SMS delivery, payment gateways.

## Architecture

```
Browser -> Angular app (/frontend) -> REST + JSON, token auth -> Django REST API (/backend) -> SQLite
```

Main flow: sign in or register, submit an appointment request (status PENDING), mock booking check, result saved as COMPLETED or FAILED, history and detail showing only the records the user's role allows.

## Repository layout

```
/frontend   Angular application
/backend    Django REST Framework API
```

## Getting started

Setup commands are added in each folder once the apps are scaffolded (Day 2):

- [frontend/README.md](frontend/README.md)
- [backend/README.md](backend/README.md)

## Team workflow

- `main` is protected. No direct commits.
- Work from an assigned GitHub Issue on a focused branch (`feature/short-name`, `fix/short-name`, `chore/short-name`).
- Open a pull request that links the issue (`Closes #n`).
- One teammate approves before merge. The author resolves all review comments.
- Never commit credentials or personal data.

## Roadmap

10 working days, 2 weeks. Week 1 builds the backend API. Week 2 builds the Angular frontend, tests, README and the final demo.

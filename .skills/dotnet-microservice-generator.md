---
name: dotnet-microservice-generator
description: Generate a lightweight standard ASP.NET Core microservice using minimal necessary structure.
---

# ASP.NET Core Standard Microservice Generator

Generate a SIMPLE, CLEAN and STANDARD .NET 8 microservice.

## General Rules

- Keep code concise.
- Avoid unnecessary abstraction.
- Avoid advanced patterns unless required.
- Avoid over-commenting.
- Avoid extra layers.
- No test projects.
- No Dockerfile unless requested.
- No CI/CD.
- No logging frameworks unless required.

## Architecture Guidelines

If architectureStyle == "minimal-api":
- Use Minimal API style.
- Single project structure.
- Basic folder organization.

If architectureStyle == "simple-clean":
- Use simplified Clean Architecture.
- Domain: Entities only.
- Application: Services + DTOs.
- Infrastructure: DbContext + Repositories.
- API: Controllers.

## Technical Rules

- Use EF Core only if persistence is required.
- Use InMemory DB if database not specified.
- Use async methods.
- Use basic validation only if required.
- Add Swagger.
- Generate appsettings.json.
- Generate README.md (short, max 30 lines).
- Generate .gitignore.

## File Generation Rules

- Use write_file tool for every file.
- Generate only necessary files.
- Keep total file count under 40.
- No explanations.
- No markdown output.
- Only generate files.

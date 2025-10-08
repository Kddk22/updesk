# 🔄 Docker Workflow Diagramm

## Gesamtübersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                            │
│                                                                   │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │  Push main   │              │   Release    │                 │
│  │              │              │  Published   │                 │
│  └──────┬───────┘              └──────┬───────┘                 │
│         │                             │                          │
└─────────┼─────────────────────────────┼──────────────────────────┘
          │                             │
          ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                       │
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │   Push Workflow          │  │   Release Workflow       │    │
│  │                          │  │                          │    │
│  │  1. Checkout Code        │  │  1. Checkout Code        │    │
│  │  2. Setup QEMU           │  │  2. Setup QEMU           │    │
│  │  3. Setup Buildx         │  │  3. Setup Buildx         │    │
│  │  4. Login Docker Hub     │  │  4. Login Docker Hub     │    │
│  │  5. Extract Metadata     │  │  5. Extract Metadata     │    │
│  │  6. Build Multi-Platform │  │  6. Build Multi-Platform │    │
│  │     - linux/amd64        │  │     - linux/amd64        │    │
│  │     - linux/arm64        │  │     - linux/arm64        │    │
│  │  7. Push: latest         │  │  7. Push: v2.0.0, latest │    │
│  │  8. Build Summary        │  │  8. Update Docker Hub    │    │
│  │                          │  │  9. Build Summary        │    │
│  └──────────┬───────────────┘  └──────────┬───────────────┘    │
│             │                             │                     │
└─────────────┼─────────────────────────────┼─────────────────────┘
              │                             │
              ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Hub                                │
│                    uptecps/updesk                                │
│                                                                   │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │   latest     │◄─────────────┤   v2.0.0     │                 │
│  │  (updated)   │              │    (new)     │                 │
│  └──────────────┘              └──────────────┘                 │
│                                                                   │
│  Platforms: linux/amd64, linux/arm64                            │
└─────────────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Users                                   │
│                                                                   │
│  docker pull uptecps/updesk:latest    # Neueste Version         │
│  docker pull uptecps/updesk:v2.0.0    # Spezifische Version     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detaillierter Push-Workflow

```
Developer
    │
    │ git push origin main
    ▼
GitHub Repository (main branch)
    │
    │ Trigger: push event
    ▼
GitHub Actions
    │
    ├─► Checkout Code
    │
    ├─► Setup QEMU (für ARM64 Emulation)
    │
    ├─► Setup Docker Buildx (Multi-Platform)
    │
    ├─► Login to Docker Hub
    │   └─► Secrets: DOCKER_USERNAME, DOCKER_PASSWORD
    │
    ├─► Extract Metadata
    │   └─► IS_RELEASE=false
    │   └─► VERSION=dev-abc1234
    │
    ├─► Build Docker Image
    │   ├─► Platform: linux/amd64 (~5-8 Min)
    │   └─► Platform: linux/arm64 (~10-15 Min)
    │
    ├─► Push to Docker Hub
    │   └─► Tag: latest
    │
    └─► Build Summary
        └─► "Docker Latest Build Successful!"
            ├─► Branch: main
            ├─► Commit: abc1234
            └─► Tag: latest

Docker Hub
    │
    └─► uptecps/updesk:latest (updated)

Users
    │
    └─► docker pull uptecps/updesk:latest
```

---

## Detaillierter Release-Workflow

```
Maintainer
    │
    │ git tag -a v2.0.0 -m "Release v2.0.0"
    │ git push origin v2.0.0
    ▼
GitHub Repository
    │
    │ Create Release on GitHub
    ▼
GitHub Actions
    │
    │ Trigger: release published event
    ▼
    │
    ├─► Checkout Code
    │
    ├─► Setup QEMU (für ARM64 Emulation)
    │
    ├─► Setup Docker Buildx (Multi-Platform)
    │
    ├─► Login to Docker Hub
    │   └─► Secrets: DOCKER_USERNAME, DOCKER_PASSWORD
    │
    ├─► Extract Metadata
    │   └─► IS_RELEASE=true
    │   └─► VERSION=v2.0.0
    │
    ├─► Build Docker Image
    │   ├─► Platform: linux/amd64 (~5-8 Min)
    │   └─► Platform: linux/arm64 (~10-15 Min)
    │
    ├─► Push to Docker Hub
    │   ├─► Tag: v2.0.0 (new)
    │   └─► Tag: latest (updated)
    │
    ├─► Update Docker Hub Description
    │   └─► From: DOCKER-README.md
    │
    └─► Build Summary
        └─► "Docker Release Build Successful!"
            ├─► Release: v2.0.0
            ├─► Tags: v2.0.0, latest
            └─► Platforms: amd64, arm64

Docker Hub
    │
    ├─► uptecps/updesk:v2.0.0 (new)
    └─► uptecps/updesk:latest (updated)

Users
    │
    ├─► docker pull uptecps/updesk:v2.0.0  # Stable
    └─► docker pull uptecps/updesk:latest  # Also v2.0.0
```

---

## Tag-Strategie Visualisierung

```
Timeline:
─────────────────────────────────────────────────────────────►

Push #1 (main)
    │
    └─► latest ──────────────────────────────────────────────►
        (commit: abc1234)

Push #2 (main)
    │
    └─► latest ──────────────────────────────────────────────►
        (commit: def5678)  ← Updated!

Release v2.0.0
    │
    ├─► v2.0.0 ─────────────────────────────────────────────►
    │   (permanent)
    │
    └─► latest ──────────────────────────────────────────────►
        (now points to v2.0.0)  ← Updated!

Push #3 (main)
    │
    └─► latest ──────────────────────────────────────────────►
        (commit: ghi9012)  ← Updated again!
        (v2.0.0 stays unchanged)

Release v2.1.0
    │
    ├─► v2.1.0 ─────────────────────────────────────────────►
    │   (permanent)
    │
    └─► latest ──────────────────────────────────────────────►
        (now points to v2.1.0)  ← Updated!
        (v2.0.0 stays unchanged)
```

---

## Build-Prozess Visualisierung

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Build Process                      │
└─────────────────────────────────────────────────────────────┘

Source Code
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Dockerfile                                                  │
│                                                              │
│  FROM node:20-alpine                                        │
│  WORKDIR /app                                               │
│  COPY package*.json ./                                      │
│  RUN npm ci --only=production                               │
│  COPY . .                                                   │
│  RUN npm run build                                          │
│  EXPOSE 3000                                                │
│  CMD ["npm", "start"]                                       │
└─────────────────────────────────────────────────────────────┘
    │
    ├─────────────────────┬─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────┐         ┌─────────┐         ┌─────────┐
│ AMD64   │         │ ARM64   │         │ Cache   │
│ Build   │         │ Build   │         │ Layer   │
│         │         │ (QEMU)  │         │         │
│ ~5-8min │         │~10-15min│         │ GitHub  │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     └───────────────────┴───────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Multi-Platform  │
              │  Docker Image    │
              └──────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   Docker Hub     │
              │  uptecps/updesk  │
              └──────────────────┘
```

---

## Entscheidungsbaum

```
                    GitHub Event
                         │
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
   Push to main?                    Release published?
        │                                 │
        │ YES                             │ YES
        ▼                                 ▼
┌───────────────┐               ┌───────────────────┐
│ Push Workflow │               │ Release Workflow  │
└───────────────┘               └───────────────────┘
        │                                 │
        ▼                                 ▼
  Build Image                       Build Image
        │                                 │
        ▼                                 ▼
  Push: latest                      Push: v2.0.0
        │                           Push: latest
        │                                 │
        ▼                                 ▼
  Build Summary                     Update Docker Hub
        │                           Build Summary
        │                                 │
        └────────────────┬────────────────┘
                         │
                         ▼
                   Docker Hub
                 uptecps/updesk
```

---

## Plattform-Support

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Platform Build                      │
└─────────────────────────────────────────────────────────────┘

                    Docker Buildx
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐               ┌───────────────────┐
│  linux/amd64  │               │   linux/arm64     │
│               │               │                   │
│  - x86_64     │               │  - ARM v8         │
│  - Intel      │               │  - Raspberry Pi 4 │
│  - AMD        │               │  - Apple Silicon  │
│               │               │  - AWS Graviton   │
└───────────────┘               └───────────────────┘
        │                                 │
        └────────────────┬────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Manifest List   │
              │  (Multi-Arch)    │
              └──────────────────┘
                         │
                         ▼
                   Docker Hub
              uptecps/updesk:latest
              uptecps/updesk:v2.0.0
```

---

**Workflow Visualisierung für UpDesk Docker Builds! 🚀**

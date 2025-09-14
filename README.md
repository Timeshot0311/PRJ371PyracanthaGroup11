# PRJ371PyracanthaGroup11
A collection of solutions to help detect and report on invasive species like **Pyracantha**.

> **Contents**
> - API & Swagger (try-it tutorial + admin creds)
> - Database (SSMS connection)
> - Docker (one-command compose + first-run disclaimers)
> - Android App (build & run)
> - Web App (beginner steps + dev tunneling/port forwarding + admin creds)

---

## 1) API (Swagger & Usage)
<details>
  <summary><strong>Open Swagger & try the API</strong></summary>

**Swagger URL (local):**
```
http://localhost:8080/docs or your neteork:8080/docs 
```

**How to try calls in Swagger:**
1. Open the URL above in your browser.
2. Click **Authorize** (top-right) if the API requires credentials.
3. Use the basic admin account (below) if prompted.
4. Expand any endpoint → click **Try it out** → fill required fields → **Execute**.
5. Inspect the **Response** section for status code, response body, and curl.

**Basic Admin (used in both API & Web):**
```
Username: invascan
Password: 1nv9sc9n
```

</details>

---

## 2) Database (SQL Server)
<details>
  <summary><strong>Connect with SSMS</strong></summary>

Open **SQL Server Management Studio (SSMS)** and use **Connect → Database Engine** with:

```
Server type:  Database Engine
Server name:  localhost,1406
Authentication: SQL Server Authentication
Login:        sa
Password:     G9e@7I4RiCT#
```

> Tip: Ensure the SQL Server container is running (see Docker section).  
> If you get a connection error, wait a moment and try again after the first startup.

</details>

---

## 3) Docker (API & Database via docker-compose)
<details>
  <summary><strong>Start everything with ONE command</strong></summary>

**Prerequisites**
- Install **Docker Desktop** and make sure it’s **running**.

**Steps (Windows PowerShell or Terminal):**
1. Change directory to the provided compose folder:
   ```
   cd C:\Users\GitHub\PRJ371PyracanthaGroup11\Docs\docker-setup\invascan-project_21-08-2025
   ```
2. Start all services:
   ```
   docker-compose up -d
   ```

That’s it. The compose file will launch:
- **API** (exposes Swagger at `http://localhost:8080/docs`)
- **SQL Server** (host port **1406** → container **1433**) used by the API

**First-run disclaimers**
- The very first install will **download a large number of images**. This is normal and can be slow.
- On the first run, containers may briefly appear **Unhealthy** while services initialize.
  - Open **Docker Desktop**, wait a bit, then **Start/Restart** the container if needed; it usually recovers once images and migrations finish.

**Useful commands**
```
docker ps                          # See running containers
docker logs <container_name>       # View logs for troubleshooting
docker-compose down                # Stop & remove containers (keeps images/volumes)
```

</details>

---

## 4) Android App
<details>
  <summary><strong>Build & run the Android client</strong></summary>

1. Open the Android project in **Android Studio**.
2. Let Gradle sync complete (accept any prompts).
3. Connect a device or create an emulator (AVD).
4. Click **Run ▶** (or press **Shift+F10**).

**Login (test account):**
```
Username: invascan
Password: 1nv9sc9n
```

</details>

---

## 5) Web App (Next.js)
<details>
  <summary><strong>Zero-assumption setup (local dev) + dev tunneling</strong></summary>

**Prerequisites**
- Install **Node.js** (which includes `npm`).

**Start the web app locally**
1. In your code editor (VS Code recommended), open the **web app folder** (for example: `Source\InvascanWeb`).
   - VS Code: Right-click the folder → **Open in Integrated Terminal**, or:
   - Manual: Open a terminal and `cd` into the folder.
2. Install dependencies:
   ```
   npm i
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open the site:
   ```
   http://localhost:3000/
   ```

**Admin login (same as API)**
```
Username: invascan
Password: 1nv9sc9n
```

**Live-site note**
- If you are testing against a deployed (hosted) site, it may take **a minute or two** before it can start receiving API requests after cold start.

**Dev tunneling / Port Forwarding (GitHub sign-in & Public visibility)**
- If you are using **GitHub Codespaces** or **VS Code Dev Tunnels** to share your local server:
  1. Ensure your dev server is running on port **3000** (`npm run dev`).
  2. Open the **Ports** panel (Codespaces) or the **Tunnels** panel (VS Code).
  3. When prompted, **sign in to GitHub** and **authorize** access.
  4. Locate the forwarded **3000** entry, set **Visibility** to **Public** (it’s often **Private** by default).
  5. Copy the **Public** URL to share or open it in a browser.

> If you cannot see the site from another device, re-check that the forwarded port is **Public**, you are signed into GitHub, and the tunnel is online.

</details>

---

## Troubleshooting (quick reference)

- **Swagger not loading** → Confirm Docker containers are running: `docker ps`. If needed, `docker-compose down` then `docker-compose up -d` again.  
- **SSMS can’t connect** → Use `localhost,1406` and the SA password above; ensure the SQL container is running.  
- **Web can’t reach API** → Make sure the API container is up and Swagger at `http://localhost:8080/docs` is reachable; if using tunnels, ensure the API URL is accessible from the web app environment.

---

## Credits
- Built for **PRJ371** to assist detection and reporting of invasive species such as *Pyracantha*.

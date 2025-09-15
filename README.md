# PRJ371PyracanthaGroup11
A collection of solutions to help detect and report on invasive species like **Pyracantha**.

> **Contents**
> - API & Swagger (try-it tutorial + admin creds)
> - Database (SSMS connection)
> - Docker (one-command compose + first-run disclaimers + network access)
> - Android App (build & run)
> - Web App (beginner steps + dev tunneling/port forwarding + admin creds + network access + dockerized access)

---

## 1) API (Swagger & Usage)
<details>
  <summary><strong>Open Swagger & try the API</strong></summary>

**Swagger URL (local):**
```
http://localhost:8080/docs
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

### Accessing Invascan on Your Network (Static IP + Port Forwarding)
> This may be **necessary for the API to work** from other devices (e.g., your phone) on your network.

1) **Assign a Static IP (so it doesn’t change)**
- Open your router’s admin page in a browser (often `http://192.168.0.1` or `http://192.168.1.1`).
- Log in (ask whoever set it up if you don’t know the password).
- Find **DHCP → Address Reservation** (or **LAN Settings**).
- Locate your laptop in the connected devices list (name + current IP, e.g., `192.168.1.101`).
- Click **Reserve / Add / Bind** → permanently assign that IP to your laptop.
- Save and reboot the router if needed.

2) **Forward the Ports (so others can connect)**
In **NAT Forwarding → Port Forwarding**, add **two** rules:

| Service | External Port | Internal Port | Internal IP         | Protocol |
|--------:|--------------:|--------------:|---------------------|:--------:|
| API     | 8080          | 8080          | your laptop’s IP    |   TCP    |
| Proxy   | 8000          | 8000          | your laptop’s IP    |   TCP    |

Example:
- **Service Name**: InvascanAPI  
- **Internal IP**: `192.168.1.101` (replace with your static IP)  
- **External Port**: `8080`  
- **Internal Port**: `8080`  
- **Protocol**: TCP (or **All** if TCP/UDP isn’t separate)  
Repeat for port **8000**.

3) **Test on Your Phone (same Wi‑Fi)**
- Open:
  - `http://192.168.1.101:8000`  → Proxy (main entry point)  
  - `http://192.168.1.101:8080/docs` → API Swagger  
  Replace `192.168.1.101` with the static IP you set.

✅ Use **8000** for the main site (via reverse proxy).  
✅ Use **8080** to hit the API directly.

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

> **Before starting any dev tunnel/forwarding for port 3000**, complete the **Static IP + Port Forwarding** steps from the Docker section so API calls work from other devices. With the current iteration of the code, even **localhost** access may require forwarding **8080/8000** for the API/reverse proxy when testing across devices or networks.

### Accessing Invascan on Your Network (Static IP + Port Forwarding)
Follow the same **Static IP** and **Port Forwarding** instructions described in the **Docker** section above.  
This must be done **before** setting up a public dev tunnel for the **3000** port, otherwise the web app won’t be able to reach the API from phones/other devices.  
- Forward: **8080** (API) and **8000** (proxy) to your laptop’s static IP.  
- Then forward/share **3000** (web dev server) as **Public** in your tunnel.

### Dockerized Web App (Ease of Access)
For convenience, we also **dockerized the web application**.  
- When you run the full `docker-compose up -d` command (see Docker section), the website is automatically served at:
```
http://localhost:8082
```
This allows you to access the site directly without needing to install Node.js, run npm commands, or set up tunnels manually. It’s a quick-start option for users with no prior web dev knowledge just to test and use the site, dev work still needs to be done through the usual localhost/dev tunnels.

</details>

---

## Troubleshooting (quick reference)

- **Swagger not loading** → Confirm Docker containers are running: `docker ps`. If needed, `docker-compose down` then `docker-compose up -d` again.  
- **SSMS can’t connect** → Use `localhost,1406` and the SA password above; ensure the SQL container is running.  
- **Web can’t reach API** → Make sure the API container is up and Swagger at `http://localhost:8080/docs` is reachable; if using tunnels or testing from a phone, ensure static IP + router **port forwarding** (8080/8000) is configured, and your **3000** tunnel visibility is **Public**.

---

## Credits
- Built for **PRJ371** to assist detection and reporting of invasive species such as *Pyracantha*.

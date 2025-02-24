# **SaturnWave**

**SaturnWave** is an open-source Discord bot that offers a variety of commands to enhance your server's functionality and engagement.

## **Commands**

Here are some of the main commands available:

- **`/server`**: Get detailed information about the server.
- **`/user`**: Fetch details about a user.
- **`/avatar`**: View a user's avatar.
- **`/lurk`**: Set your status to "lurking".
- **`/ban`**: Ban a user from the server.
- **`/kick`**: Kick a user from the server.
- **`/flip`**: Flip a coin.
- **`/roll`**: Roll a die.
- **`/invite`**: Get the bot's invite link.
- **`/ping`**: Check the bot's latency.
- **`/uptime`**: View how long the bot has been online.

## **Modules: Rings**

You can enable or disable modules with the following commands:

- **Enable**: `/module enable [module name]`
- **Disable**: `/module disable [module name]`

### **Modules List**

<!-- 1. **Inactivity**

   The _Inactivity_ module helps manage idle users by warning or kicking them after a set period of inactivity.

   - **Commands**:
     - **`/inactivity setPeriod [hours]`**: Set the inactivity period (in hours) before users are kicked.
     - **`/inactivity settings`**: View the current inactivity module settings.
     - **`/inactivity blacklist [role]`**: Add a role to the blacklist (ignores inactivity checks).
     - **`/inactivity whitelist [role]`**: Remove a role from the blacklist.
     - **`/inactivity viewBlacklist`**: View all currently blacklisted roles. -->

1. **Levels**

The _Levels_ module allowes users to gain levels by chatting in your server, as well as unlocking special perks to go along with that.

## **Version**

**Current version**: **V2**

SaturnWave is open-source and maintained by its creator. Feel free to explore the code and adapt it for your needs.

## **What to expect**

We are currently very early in development, so we have lots of features planned.

Here is our plans.

**MODULES**

- AFK
- Customization
- Automod+
- Fun
- Econemy
- Inactivity management
- Rules
- Use prefix instead of application commands

**COMMANDS**

Core

- /whois
- /membercount
- /welcomemessage
- /leavemessage

Moderation

- /Timeout /mute /removetimeout /unmute
- /Quarentine
- /Slowmode
- /Lock /unlock
- /softban
- /temprole
- /clear /purge

Fun

- /8ball
- /joke
- /weather
- /truthordare
- /rps

Role management

- /rolecreate
- /roledelete
- /roleadd
- /roleremove
- /rolecolor
- /rolelist

**OTHER SYSTEMS**

- Cases system (simular to Dyno or Wick)
- Permissions system (Differ from discord permissions, perms to use commands)

If you have any more ideas create an issue on the github repo.

## **How to Set Up Your Own Bot**

### **What You’ll Need:**

Make sure you have these installed before starting:

1. **PostgreSQL & pgAdmin4** – For your database.
2. **Node.js** – To run JavaScript on your computer.
3. **Git** – To download the bot’s code.

---

### **Step-by-Step Instructions**

1. **Create a Project Folder:**

   - Make a new folder anywhere you like.
   - This will hold all the bot files.

2. **Open a Command Line in the Folder:**

   - Right-click inside the folder and select:
     - On Windows: `Open in Terminal` or `Open Command Prompt here`.
     - On Mac: `Open Terminal`.
   - If not, open your terminal manually and type:
     ```bash
     cd path/to/your/folder
     ```

3. **Download the Bot Code:**  
   In the terminal, run:

   ```bash
   git clone https://github.com/Flamality/SaturnWave
   ```

4. **Navigate to the Project Folder:**

   ```bash
   cd SaturnWave
   ```

5. **Install the Project Dependencies:**  
   This installs all the needed libraries:

   ```bash
   npm ci
   ```

6. **Set Up Environment Variables:**

   - Find the file named `.env.example`.
   - Rename it to `.env`.
     - Windows: Right-click > Rename
     - Terminal:
       ```bash
       mv .env.example .env
       ```
   - Open `.env` in any text editor (like VS Code or Notepad).
   - Fill in the required information (API keys, tokens, etc.). The file should have comments to guide you.

7. **Set Up Your Database:**

   - Open **pgAdmin4** or use your terminal to connect to PostgreSQL.
   - Create a new database (name it anything you like).

8. **Create the Necessary Table:**  
   Run this SQL command inside your database:

   ```sql
   CREATE TABLE levels (
     userID TEXT NOT NULL,
     guildID TEXT NOT NULL,
     xp INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (userID, guildID)
   );
   ```

   as well as

   ```sql
   CREATE TABLE servers (
   server_id BIGINT PRIMARY KEY,
   settings JSON NOT NULL,
   cases JSON NOT NULL
   );
   ```

9. **Start the Bot:**  
   In the terminal, run:
   ```bash
   node src/index.js
   ```

---

**That’s it! Your bot should now be running!**  
If you see any errors, double-check the `.env` file and make sure PostgreSQL is running.

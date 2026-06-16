# MongoDB Atlas Setup Guide

Hometown Hub relies on MongoDB Atlas for its cloud database infrastructure. Follow these steps to configure your cluster.

## 1. Create a Cluster
1. Log in to [MongoDB Atlas](https://account.mongodb.com/).
2. Create a new project named `Hometown-Hub`.
3. Build a Database. You can use the free **M0 cluster** for development and testing.

## 2. Configure Database Access (Users)
1. In the left sidebar, under Security, click **Database Access**.
2. Click **Add New Database User**.
3. Create a user:
   - **Username:** `zaidhusain2780_db_user`
   - **Password:** Generate a highly secure password and save it.
4. Set privileges to `Read and write to any database` (or restrict it strictly to `hometown-hub`).

## 3. Configure Network Access (IP Whitelist)
1. In the left sidebar, under Security, click **Network Access**.
2. Click **Add IP Address**.
3. For development, you can select **Allow Access From Anywhere** (`0.0.0.0/0`). 
   - *Note: For production, you should restrict this strictly to the static IP addresses of your deployed backend server (e.g., Vercel, Railway, AWS).*

## 4. Get Your Connection String
1. Go back to **Database** and click the **Connect** button on your cluster.
2. Select **Drivers** (Node.js).
3. Copy the connection string.
4. It should look like this:
   `mongodb+srv://zaidhusain2780_db_user:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

## 5. Update Environment Variables
1. Insert the `<password>` you generated in step 2.
2. Insert `hometown-hub` right before the `?` query parameters so Mongoose knows exactly which database to use.
   `mongodb+srv://zaidhusain2780_db_user:<your-password>@cluster0.xxxx.mongodb.net/hometown-hub?retryWrites=true&w=majority&appName=Cluster0`
3. Paste this into your `.env.local` inside the `MONGODB_URI` variable.

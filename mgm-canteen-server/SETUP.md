# Setup: email verification, password reset, food images

## 1. Gmail SMTP (free)
1. Turn on 2-Step Verification on the Gmail account.
2. Google Account -> Security -> App passwords -> create one (16 characters).
3. Set two environment variables before starting Spring Boot:

    MAIL_USERNAME=yourname@gmail.com
    MAIL_APP_PASSWORD=your16characterapppassword

In Eclipse/STS: Run Configurations -> Environment tab. Never put the password in application.properties.

**No Gmail yet?** Leave both empty. The app runs in DEV mode: nothing is emailed and the
6-digit code is printed in the server console ("[DEV MODE - no email sent] ...").

## 2. Run
    Backend:   ./mvnw spring-boot:run          (port 8080)
    Frontend:  npm install && npm run dev      (port 5173)

## 3. API
| Method | URL | Body | Who |
|---|---|---|---|
| POST | /api/auth/send-otp | { email } | anyone (registration step 1) |
| POST | /api/auth/register | { name, email, phone, password, otp } | anyone (step 2, returns token) |
| POST | /api/auth/login | { email, password } | anyone |
| POST | /api/auth/forgot-password | { email } | anyone |
| POST | /api/auth/reset-password | { email, otp, newPassword } | anyone |
| POST | /api/food/image | multipart field "file" -> { imageUrl } | ADMIN |
| POST | /api/food, PUT /api/food/{id} | food JSON (now with imageUrl) | ADMIN |
| GET  | /uploads/{file} | | public |

Codes: 6 digits, valid 5 minutes, 60 s between requests, 5 wrong tries then the code is discarded.

## 4. Food images
- Admin page: choose a photo (JPG/PNG/WEBP/GIF, max 3 MB) or paste a link. Existing items have a
  "Add photo / Change photo" button.
- Photos are saved in the `uploads/` folder next to where the backend runs (setting: app.upload-dir).
  Back this folder up and keep it when you deploy.
- A new column `image_url` is added to the food table automatically (ddl-auto=update).
- Foods without a photo show a picture for their category (meal / snack / drink / dessert),
  stored in frontend `public/foods/`.

## 5. Things to know
- Only ADMIN users can add/edit food now (before, any logged-in user could call the API).
  Make yourself admin in MySQL:  UPDATE user SET role='ADMIN' WHERE email='you@example.com';
- POST /api/user is now admin-only; students register through /api/auth/register.
- MSG91 (mobile OTP) was removed: its service class, properties and the frontend .env keys.
- Codes are kept in memory, so a server restart clears pending codes. Fine for one server.

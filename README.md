# 🚀 SocialPulse - Full Stack Social Media Application

Assignment Implementation covering all **21 Objectives**:
1. **login** - `/api/auth/login` & `/login`
2. **signup** - `/api/auth/signup` & `/signup`
3. **logout** - `/api/auth/logout` & Navbar logout
4. **auth guard** - Backend `protect` middleware & Frontend `<AuthGuard>`
5. **edit profile** - `/api/users/profile` & Edit Profile Modal
6. **edit password** - `/api/users/password` & Password Change Tab
7. **edit picture** - `/api/users/avatar` & Avatar Upload
8. **post CRUD** - `/api/posts` (Create, Read, Update, Delete)
9. **post user data populate** - `.populate('author')` with name, username, avatar
10. **single post** - `/api/posts/:id` & `/post/:id`
11. **single profile** - `/api/users/:identifier` & `/profile/:username`
12. **single profile posts** - `/api/posts/user/:userId`
13. **upload image with post** - Multer upload in post creation
14. **search** - `/api/users/search?q=...` & `/search`
15. **share** - `/api/posts/:id/share` with link copying & share counters
16. **like** - `/api/posts/:id/like` with like/unlike toggle
17. **forgot password** - `/api/auth/forgot-password` & `/reset-password/:token`
18. **verify email** - `/api/auth/verify-email/:token` & `/verify-email/:token`
19. **chat app** - Real-time Socket.io chat & `/api/messages`
20. **comment** - `/api/posts/:id/comments` (Add, Delete, List)
21. **pagination** - Limit & page pagination on feed & profile posts

---

## 🛠️ How to Run

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
```
Backend will start on `http://localhost:5000`.

> **Note on MongoDB**: Open `server/.env` and ensure `MONGO_URI` has your actual MongoDB password instead of `<db_password>`. (If using local MongoDB, it will automatically connect to `mongodb://127.0.0.1:27017/socialapp`).

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Client will open on `http://localhost:5173`.

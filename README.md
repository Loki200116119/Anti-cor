# CleanSignal MVP

## 1. Backendni ishga tushirish

Backend papkaga kiring:

powershell
cd backend

Virtual environment yarating:

python -m venv .venv

Aktivatsiya qiling:

.\.venv\Scripts\Activate.ps1

Agar permission error chiqsa:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

Paketlarni o‘rnating:

pip install -r requirements.txt

Backendni ishga tushiring:

uvicorn app.main:app --reload

Backend localhost:

http://127.0.0.1:8000

API docs:

http://127.0.0.1:8000/docs
2. Frontendni ishga tushirish

Yangi terminal oching.

Frontend papkaga kiring:

cd frontend

Paketlarni o‘rnating:

npm install

Frontendni ishga tushiring:

npm run dev

Frontend localhost:

http://localhost:5173
3. Frontend backendga ulanishi

Frontend papkada .env fayl bo‘lishi kerak:

VITE_API_URL=http://127.0.0.1:8000

Agar .env.example bo‘lsa:

copy .env.example .env
4. Test qilish
Backend ishlayotganini tekshiring:
http://127.0.0.1:8000/docs
Frontendni oching:
http://localhost:5173
Send Report bo‘limiga kiring.
Test uchun yozing:
Toshkentdagi maktabda imtihon bahosini oshirish uchun 200 ming so‘m norasmiy to‘lov so‘raldi.
Submit qiling.

Agar hammasi to‘g‘ri bo‘lsa:

AI score chiqadi
Tracking ID chiqadi
Backend terminalda POST /reports 200 OK chiqadi
5. Muhim

Backend va frontend bir vaqtda ishlashi kerak:

Backend: http://127.0.0.1:8000
Frontend: http://localhost:5173

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

1️⃣ Backend

📍 To‘g‘ri papkaga kiring:

cd backend/cleansignal-backend-ideal/cleansignal-backend-ideal
Virtual environment (MUHIM — yangidan yarating)
Remove-Item -Recurse -Force .venv
python -m venv .venv
Aktivatsiya
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
Install + run
pip install -r requirements.txt
uvicorn app.main:app --reload

👉 Backend:

http://localhost:8000

👉 Docs:

http://localhost:8000/docs
2️⃣ Frontend (yangi terminal)

📍 Frontend papkaga kiring:

cd frontend
Run
npm install
npm run dev

👉 Frontend:

http://localhost:5173

(ba’zida 5174 chiqishi mumkin)

⚡ Qisqa versiya
# Backend
cd backend/cleansignal-backend-ideal/cleansignal-backend-ideal
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
❗ Muhim
.venvni har doim yangidan yarating
Backend ishlamasa → frontend demo modega o‘tadi
Ichma-ich papkani keyin soddalashtirish tavsiya qilinadi

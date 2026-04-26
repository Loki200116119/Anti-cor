# CleanSignal MVP

## 1. Backendni ishga tushirish

Backend papkaga kiring:
cd backend/cleansignal-backend-ideal/cleansignal-backend-ideal


Virtual environment yarating:
Remove-Item -Recurse -Force .venv
python -m venv .venv

Aktivatsiya qiling:

.\.venv\Scripts\Activate.ps1

Agar permission error chiqsa:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

Install + run
pip install -r requirements.txt
uvicorn app.main:app --reload


Backend localhost:

http://127.0.0.1:8000

API docs:
http://127.0.0.1:8000/docs

## 2 Frontendni ishga tushirish ketma-ketligi

cd frontend/cleansignal_pro_frontend
npm install
npm run dev

Keyin brauzerda ochiladi:

http://localhost:5173

Agar 5173 band bo‘lsa, Vite boshqa port beradi, masalan:

http://localhost:5174
.env haqida

Frontend ichida bu bo‘lishi kerak:

VITE_API_URL=http://127.0.0.1:8000

Bu frontend backendga ulanishi uchun kerak.

❗ Muhim
.venvni har doim yangidan yarating
Backend ishlamasa → frontend demo modega o‘tadi
Ichma-ich papkani keyin soddalashtirish tavsiya qilinadi

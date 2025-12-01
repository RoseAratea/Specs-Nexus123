# Backend Connection Check

If you're having login issues, make sure:

1. **Backend server is running:**
   - Navigate to: `specs-nexus-main`
   - Activate virtual environment: `..\venv\Scripts\Activate.ps1` (PowerShell) or `..\venv\Scripts\activate.bat` (CMD)
   - Start server: `python run.py`
   - Server should be running on `http://localhost:8000`

2. **Check browser console** for specific error messages

3. **Test backend connection:**
   - Open browser and go to: `http://localhost:8000/`
   - Should see: `{"message": "Welcome to SPECS Nexus API"}`

4. **Check API URL:**
   - Frontend uses: `http://localhost:8000` when running locally
   - Or: `https://specs-nexus.onrender.com` for production


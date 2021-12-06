echo "RUNNING THE BASH SCRIPT.........."
if psql -U postgres postgres < setup.sql; then
    echo "Database Created!"
    if python load_data.py; then
        echo "Data Tables Created And Data Loaded Successfully!"
        cd childcare_db
        npm install
        npm run dev
    else
        echo "Code Failure for $?, Exit"
    fi
else
    echo "Code Failure for $?, Exit"
fi
echo "Bash Script Done!"
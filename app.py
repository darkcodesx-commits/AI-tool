from flask import Flask, render_template, jsonify, request
import pandas as pd
import joblib
import os
import sys

app = Flask(__name__)

# -------------------------------
# Paths
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'noshow_model.pkl')
CSV_PATH = os.path.join(BASE_DIR, 'appointments.csv')

# -------------------------------
# Check model and CSV
# -------------------------------
if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model file not found at {MODEL_PATH}")
    sys.exit(1)

if not os.path.exists(CSV_PATH):
    print(f"ERROR: Appointments CSV not found at {CSV_PATH}")
    sys.exit(1)

# Load model and CSV
noshow_model = joblib.load(MODEL_PATH)
appointments_df = pd.read_csv(CSV_PATH)
print(f"Loaded model and CSV successfully. Total appointments: {len(appointments_df)}")

# -------------------------------
# Feature columns (match your CSV)
# -------------------------------
feature_columns = ['Age', 'hour', 'SMS_received']

for col in feature_columns:
    if col not in appointments_df.columns:
        print(f"ERROR: Feature column '{col}' not found in CSV")
        sys.exit(1)

# -------------------------------
# Predict no-show probabilities
# -------------------------------
def predict_no_show(df):
    try:
        X = df[feature_columns]
        probabilities_array = noshow_model.predict_proba(X)[:,1]  # probability of no-show
        probabilities = {time: round(prob, 2) for time, prob in zip(df['time'], probabilities_array)}
        print("Probabilities calculated successfully.")  # Debug
        return probabilities
    except Exception as e:
        print("Error predicting no-show probabilities:", e)
        return {time: 0.0 for time in df['time']}  # fallback

# -------------------------------
# Suggest top N best slots
# -------------------------------
def suggest_best_slots(probabilities, df, top_n=3):
    free_slots = [time for time, occ in zip(df['time'], df['occupied']) if occ == 0]
    sorted_slots = sorted(free_slots, key=lambda x: probabilities.get(x, 1))
    return sorted_slots[:top_n]

# -------------------------------
# Routes
# -------------------------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def api_data():
    probabilities = predict_no_show(appointments_df)
    best_slots = suggest_best_slots(probabilities, appointments_df, top_n=3)

    table_data = []
    for idx, row in appointments_df.iterrows():
        table_data.append({
            "time": row['time'],
            "occupied": int(row['occupied']),
            "probability": probabilities.get(row['time'], 0.0),
            "best_slot": row['time'] in best_slots
        })
    return jsonify({"table_data": table_data, "best_slots": best_slots})

@app.route('/api/book', methods=['POST'])
def book_slot():
    slot = request.json.get('slot')
    if slot in appointments_df['time'].values:
        appointments_df.loc[appointments_df['time'] == slot, 'occupied'] = 1
        return jsonify({"status": "success", "booked_slot": slot})
    else:
        return jsonify({"status": "error", "message": "Slot not found"})

# -------------------------------
# Run Flask
# -------------------------------
if __name__ == '__main__':
    print("Starting Flask app...")
    app.run(debug=True)

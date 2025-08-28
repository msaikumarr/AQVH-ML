import joblib
import numpy as np
import pandas as pd
import json
import pickle
from sklearn.preprocessing import MinMaxScaler

# --- Qiskit imports ---
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
from qiskit_algorithms.optimizers import COBYLA
from qiskit_machine_learning.algorithms.classifiers import VQC
try:
    from qiskit.primitives import StatevectorSampler as Sampler
except ImportError:
    from qiskit.primitives import Sampler

def load_svm_model(file_path='backend/models/svm_model.pkl'):
    """Loads a trained SVM model from a file."""
    return joblib.load(file_path)

def load_vqc_model(weights_path='backend/models/ibm_vqc_weights.npy', num_features=3):
    """Recreates the VQC model and loads its trained weights."""
    weights = np.load(weights_path)
    vqc = VQC(
        sampler=Sampler(),
        feature_map=ZZFeatureMap(feature_dimension=num_features, reps=2, entanglement='linear'),
        ansatz=RealAmplitudes(num_qubits=num_features, reps=3, entanglement='linear'),
        optimizer=COBYLA(maxiter=0),
        initial_point=weights
    )
    vqc.fit(np.zeros((2, num_features)), np.array([0, 1]))
    return vqc

def preprocess_new_data(new_data_df):
    """Loads preprocessing tools and transforms new data."""
    # Load the list of feature names that the model was trained on
    with open('backend/models/selected_features.json', 'r') as f:
        selected_features = json.load(f)
    print(f"✓ Loaded required features: {selected_features}")

    # Load the scaler
    scaler = joblib.load('backend/models/data_scaler.pkl')
    print("✓ Loaded fitted scaler")

    # Select the required features from the new data
    data_selected = new_data_df[selected_features]

    # Scale the data using the loaded scaler
    data_scaled = scaler.transform(data_selected)
    
    return data_scaled

if __name__ == "__main__":
    # --- INPUT YOUR NEW DATA HERE ---
    # Data for 2010-01-06
    new_data_values = [0.0, 99.9999, 50.0, 1.7709, 0.3541, 24.8623, 1149301200]


    # The original feature columns
    original_features = ['sma_crossover', 'price_sma_ratio', 'rsi', 'macd', 'macd_hist', 'adx', 'obv']

    # Create a DataFrame
    new_data_df = pd.DataFrame([new_data_values], columns=original_features)

    print("New data to predict:")
    print(new_data_df)

    # Preprocess the new data
    preprocessed_data = preprocess_new_data(new_data_df)

    # Load the trained models
    svm_model = load_svm_model()
    vqc_model = load_vqc_model()

    # Make predictions
    svm_prediction = svm_model.predict(preprocessed_data)
    vqc_prediction = vqc_model.predict(preprocessed_data)

    print(f"\nSVM Prediction: {svm_prediction}")
    print(f"VQC Prediction: {vqc_prediction}")
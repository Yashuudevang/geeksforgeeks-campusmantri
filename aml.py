# Demo: Decision Tree on an imbalanced dataset (runs here using a synthetic dataset if 'creditcard.csv' isn't present)
# This code does the following:
# 1. Tries to load 'creditcard.csv' from the current directory (if you have it, place it there).
# 2. If not found, creates a synthetic highly imbalanced dataset (~0.2% positive class).
# 3. Preprocesses (scales where appropriate) and performs stratified train/test split.
# 4. Trains a Decision Tree (baseline), evaluates metrics, and plots ROC curve.
# 5. Trains a class-weighted Decision Tree and an upsampled (random oversample) Decision Tree, evaluates them.
# 6. Plots ROC and Precision-Recall curves where appropriate and prints a summary table.

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
                             roc_auc_score, roc_curve, precision_recall_curve, confusion_matrix, auc)
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.utils import resample
import warnings
warnings.filterwarnings("ignore")

# ---------- 1) Load dataset if available, otherwise create synthetic imbalanced data ----------
DATA_FILENAME = "creditcard.csv"
if os.path.exists(DATA_FILENAME):
    print(f"Found '{DATA_FILENAME}' — loading it.\n")
    df = pd.read_csv(DATA_FILENAME)
    # Basic preprocessing tailored to the Kaggle credit card set
    # Drop Time (optional), scale Amount, keep PCA components as-is
    X = df.drop(['Class', 'Time'], axis=1)
    if 'Amount' in X.columns:
        X['Amount'] = StandardScaler().fit_transform(X[['Amount']])
    y = df['Class']
    print("Class distribution (counts):")
    print(y.value_counts())
else:
    # create a synthetic heavily imbalanced binary dataset (~0.2% positives)
    print(f"File '{DATA_FILENAME}' not found. Creating a synthetic imbalanced dataset for demo.\n")
    X_arr, y_arr = make_classification(n_samples=20000, n_features=20, n_informative=3,
                                       n_redundant=1, n_clusters_per_class=1,
                                       weights=[0.998], flip_y=0, random_state=42)
    X = pd.DataFrame(X_arr, columns=[f'feat_{i}' for i in range(X_arr.shape[1])])
    y = pd.Series(y_arr, name='Class')
    print("Class distribution (counts):", np.bincount(y))

# ---------- 2) Train / Test split (stratified) ----------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
print("\nTrain set distribution:", np.bincount(y_train))
print("Test set distribution: ", np.bincount(y_test))

# ---------- Utility: function to train, predict and evaluate a classifier ----------
def evaluate_model(clf, X_tr, y_tr, X_te, y_te, model_name="Model"):
    clf.fit(X_tr, y_tr)
    y_pred = clf.predict(X_te)
    # get probability estimates if available
    if hasattr(clf, "predict_proba"):
        y_proba = clf.predict_proba(X_te)[:, 1]
    else:
        # fallback to decision_function if available (not used for DecisionTree)
        y_proba = clf.decision_function(X_te)
    acc = accuracy_score(y_te, y_pred)
    prec = precision_score(y_te, y_pred, zero_division=0)
    rec = recall_score(y_te, y_pred, zero_division=0)
    f1 = f1_score(y_te, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_te, y_proba)
    cm = confusion_matrix(y_te, y_pred)
    return {
        "name": model_name,
        "model": clf,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "roc_auc": roc_auc,
        "y_proba": y_proba,
        "y_pred": y_pred,
        "confusion_matrix": cm
    }

# ---------- 3) Baseline Decision Tree ----------
baseline_clf = DecisionTreeClassifier(max_depth=6, min_samples_split=10, random_state=42)
baseline_res = evaluate_model(baseline_clf, X_train, y_train, X_test, y_test, model_name="Baseline DT")

print("\nBaseline Decision Tree metrics:")
print(f"Accuracy:  {baseline_res['accuracy']:.6f}")
print(f"Precision: {baseline_res['precision']:.6f}")
print(f"Recall:    {baseline_res['recall']:.6f}")
print(f"F1-score:  {baseline_res['f1']:.6f}")
print(f"ROC-AUC:   {baseline_res['roc_auc']:.6f}")
print("Confusion Matrix:\n", baseline_res['confusion_matrix'])

# Plot ROC curve for baseline
fpr, tpr, _ = roc_curve(y_test, baseline_res['y_proba'])
plt.figure()
plt.plot(fpr, tpr)
plt.plot([0,1],[0,1],'--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve - Baseline Decision Tree')
plt.grid(True)
plt.show()

# ---------- 4) Class-weighted Decision Tree (cost-sensitive) ----------
cw_clf = DecisionTreeClassifier(max_depth=6, min_samples_split=10, class_weight='balanced', random_state=42)
cw_res = evaluate_model(cw_clf, X_train, y_train, X_test, y_test, model_name="Class-weighted DT")

print("\nClass-weighted Decision Tree metrics:")
print(f"Accuracy:  {cw_res['accuracy']:.6f}")
print(f"Precision: {cw_res['precision']:.6f}")
print(f"Recall:    {cw_res['recall']:.6f}")
print(f"F1-score:  {cw_res['f1']:.6f}")
print(f"ROC-AUC:   {cw_res['roc_auc']:.6f}")
print("Confusion Matrix:\n", cw_res['confusion_matrix'])

# Plot ROC curve for class-weighted
fpr, tpr, _ = roc_curve(y_test, cw_res['y_proba'])
plt.figure()
plt.plot(fpr, tpr)
plt.plot([0,1],[0,1],'--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve - Class-weighted DT')
plt.grid(True)
plt.show()

# ---------- 5) Upsampling minority class (random oversampling) ----------
# Combine train X/y for resampling
train_df = pd.concat([X_train.reset_index(drop=True), y_train.reset_index(drop=True)], axis=1)
label_col = train_df.columns[-1]

minority = train_df[train_df[label_col] == 1]
majority = train_df[train_df[label_col] == 0]
if len(minority) == 0:
    print("\nNo minority samples in training set — cannot upsample. Skipping upsampling step.")
    up_res = None
else:
    minority_upsampled = resample(minority, replace=True, n_samples=len(majority), random_state=42)
    train_upsampled = pd.concat([majority, minority_upsampled])
    train_upsampled = train_upsampled.sample(frac=1, random_state=42).reset_index(drop=True)
    X_train_up = train_upsampled.drop(label_col, axis=1)
    y_train_up = train_upsampled[label_col]
    up_clf = DecisionTreeClassifier(max_depth=6, min_samples_split=10, random_state=42)
    up_res = evaluate_model(up_clf, X_train_up, y_train_up, X_test, y_test, model_name="Upsampled DT")
    print("\nUpsampled Decision Tree metrics:")
    print(f"Accuracy:  {up_res['accuracy']:.6f}")
    print(f"Precision: {up_res['precision']:.6f}")
    print(f"Recall:    {up_res['recall']:.6f}")
    print(f"F1-score:  {up_res['f1']:.6f}")
    print(f"ROC-AUC:   {up_res['roc_auc']:.6f}")
    print("Confusion Matrix:\n", up_res['confusion_matrix'])

    # Plot ROC for upsampled model
    fpr, tpr, _ = roc_curve(y_test, up_res['y_proba'])
    plt.figure()
    plt.plot(fpr, tpr)
    plt.plot([0,1],[0,1],'--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve - Upsampled DT')
    plt.grid(True)
    plt.show()

    # Precision-Recall curve (useful with imbalanced data)
    precision_vals, recall_vals, _ = precision_recall_curve(y_test, up_res['y_proba'])
    pr_auc = auc(recall_vals, precision_vals)
    plt.figure()
    plt.plot(recall_vals, precision_vals)
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title(f'Precision-Recall Curve - Upsampled DT (PR AUC = {pr_auc:.4f})')
    plt.grid(True)
    plt.show()

# ---------- 6) Summary table of results ----------
rows = []
for res in [baseline_res, cw_res, up_res] if up_res is not None else [baseline_res, cw_res]:
    if res is None:
        continue
    rows.append({
        "Model": res["name"],
        "Accuracy": f"{res['accuracy']:.6f}",
        "Precision": f"{res['precision']:.6f}",
        "Recall": f"{res['recall']:.6f}",
        "F1": f"{res['f1']:.6f}",
        "ROC-AUC": f"{res['roc_auc']:.6f}"
    })

summary_df = pd.DataFrame(rows)
print("\nSummary of model performance:")
print(summary_df.to_string(index=False))

# ---------- 7) Example: threshold-tuning on the upsampled model (if available) ----------
if up_res is not None:
    print("\nExample of threshold tuning (upsampled model) - precision/recall at several thresholds:")
    probs = up_res['y_proba']
    thresholds_to_check = [0.1, 0.2, 0.3, 0.4, 0.5]
    for thr in thresholds_to_check:
        y_thr_pred = (probs >= thr).astype(int)
        prec_t = precision_score(y_test, y_thr_pred, zero_division=0)
        rec_t = recall_score(y_test, y_thr_pred, zero_division=0)
        f1_t = f1_score(y_test, y_thr_pred, zero_division=0)
        print(f"Threshold {thr:.2f} -> Precision: {prec_t:.4f}, Recall: {rec_t:.4f}, F1: {f1_t:.4f}")

print("\nDemo complete. You can run this script locally against the real 'creditcard.csv' by placing the file in the same directory.")

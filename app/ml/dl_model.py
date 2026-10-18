"""PyTorch Deep Learning MLP architecture for Tabular Crop Yield Modeling."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Tuple, Optional
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

class TabularCropYieldMLP(nn.Module):
    """Multi-Layer Perceptron with Batch Normalization and Dropout for Tabular Yield Regression."""
    def __init__(self, in_features: int, hidden_dims: Tuple[int, ...] = (128, 64, 32), dropout: float = 0.15):
        super().__init__()
        layers = []
        prev_dim = in_features
        for h_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, h_dim))
            layers.append(nn.BatchNorm1d(h_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout))
            prev_dim = h_dim
        layers.append(nn.Linear(prev_dim, 1))
        self.network = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x).squeeze(-1)

def train_dl_mlp(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: Optional[np.ndarray] = None,
    y_val: Optional[np.ndarray] = None,
    epochs: int = 25,
    batch_size: int = 128,
    lr: float = 0.003,
    save_path: Optional[Path] = None
) -> Tuple[TabularCropYieldMLP, dict]:
    """Train PyTorch MLP on preprocessed feature matrices."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    in_dim = X_train.shape[1]
    model = TabularCropYieldMLP(in_features=in_dim).to(device)
    
    # Scale target for neural network numerical stability (in 10,000 hg/ha units = tonnes)
    y_train_tonnes = y_train / 10000.0
    
    dataset = TensorDataset(
        torch.tensor(X_train, dtype=torch.float32),
        torch.tensor(y_train_tonnes, dtype=torch.float32)
    )
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.MSELoss()
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=3)
    
    history = {"train_loss": [], "val_loss": []}
    
    model.train()
    for epoch in range(epochs):
        epoch_loss = 0.0
        for batch_x, batch_y in loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            preds = model(batch_x)
            loss = criterion(preds, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * len(batch_x)
            
        epoch_loss /= len(X_train)
        history["train_loss"].append(epoch_loss)
        
        # Validation if provided
        if X_val is not None and y_val is not None:
            model.eval()
            with torch.no_grad():
                val_x = torch.tensor(X_val, dtype=torch.float32).to(device)
                val_y = torch.tensor(y_val / 10000.0, dtype=torch.float32).to(device)
                val_preds = model(val_x)
                val_loss = criterion(val_preds, val_y).item()
                history["val_loss"].append(val_loss)
                scheduler.step(val_loss)
            model.train()
            
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        torch.save({
            "in_features": in_dim,
            "state_dict": model.state_dict(),
            "history": history
        }, save_path)
        
    return model, history

def predict_dl_mlp(model: TabularCropYieldMLP, X: np.ndarray) -> np.ndarray:
    """Inference helper returning yield in hectograms/ha (rescaled)."""
    model.eval()
    device = next(model.parameters()).device
    with torch.no_grad():
        t_x = torch.tensor(X, dtype=torch.float32).to(device)
        preds_tonnes = model(t_x).cpu().numpy()
        preds_hg = preds_tonnes * 10000.0
        return np.clip(preds_hg, 0.0, None)

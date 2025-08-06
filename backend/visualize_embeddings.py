"""Visualize embeddings of Lean code formalizations."""

import json
import base64
import io
from pathlib import Path
from typing import List, Dict, Any

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.axes
import numpy as np
from adjustText import adjust_text
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from sentence_transformers import SentenceTransformer

PERPLEXITY = 30


def cluster_center_idxs(embeddings: np.ndarray, labels: np.ndarray) -> list[int]:
    """Calculate the cluster centers of the embeddings.

    Args:
        embeddings (np.ndarray): The embeddings to cluster.
        labels (list): The labels corresponding to each embedding.

    Returns:
        list[int]: The indices of embeddings closest to cluster centers.
    """
    n_clusters = len(set(labels))
    closest_embedding_idxs = []
    for i in range(n_clusters):
        cluster_indices = np.where(labels == i)[0]
        if len(cluster_indices) == 0:
            continue
        cluster_embeddings = embeddings[cluster_indices]
        cluster_center = np.mean(cluster_embeddings, axis=0)

        # get embedding that is closest to cluster center
        distances = np.sum((cluster_embeddings - cluster_center) ** 2, axis=1)
        closest_in_cluster_index = np.argmin(distances)
        closest_original_index = cluster_indices[closest_in_cluster_index]
        closest_embedding_idxs.append(closest_original_index)
    return closest_embedding_idxs


def fold_title(title: str) -> str:
    """Fold a title into multiple lines if it is too long."""
    width = 30
    result = ""
    rest = title
    while len(rest) > 0:
        result += rest[:width] + "\n"
        rest = rest[width:]
    return result.strip()


def extract_embeddings(formalizations: List[Dict]) -> np.ndarray:
    """Extract embeddings from a list of formalizations."""
    return np.array([f["embedding"] for f in formalizations])


def generate_embeddings(lean_codes: List[str]) -> np.ndarray:
    """Generate embeddings for Lean code using sentence transformers."""
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(lean_codes)
    return embeddings


def create_formalizations_with_embeddings(informal_statement: str, lean_codes: List[str]) -> List[Dict]:
    """Create formalizations with embeddings from informal statement and Lean codes."""
    embeddings = generate_embeddings(lean_codes)
    formalizations = []
    
    for i, (lean_code, embedding) in enumerate(zip(lean_codes, embeddings)):
        formalizations.append({
            "lean_code": lean_code,
            "embedding": embedding.tolist(),
            "informal": informal_statement
        })
    
    return formalizations


def visualize_embeddings(
    ax: List[matplotlib.axes.Axes],
    formalizations: List[Dict],
    embeddings: np.ndarray,
    title: str = "Embedding Visualization",
) -> None:
    """Visualizes high-dimensional embeddings using t-SNE."""
    if len(embeddings) < 4:
        # If we have too few points, just show a simple scatter plot
        ax[0].text(0.5, 0.5, f"Need at least 4 formalizations\nfor clustering analysis\n(Currently: {len(embeddings)})", 
                  ha='center', va='center', transform=ax[0].transAxes, fontsize=12)
        ax[1].text(0.5, 0.5, f"Need at least 4 formalizations\nfor clustering analysis\n(Currently: {len(embeddings)})", 
                  ha='center', va='center', transform=ax[1].transAxes, fontsize=12)
        ax[0].set_title(f"2-cluster: {fold_title(title)}")
        ax[1].set_title("4-cluster")
        return

    # 2-cluster analysis
    kmeans2 = KMeans(n_clusters=min(2, len(embeddings)), random_state=0, n_init="auto")
    labels_2cluster = kmeans2.fit_predict(embeddings)
    cluster2_center_idxs = cluster_center_idxs(embeddings, labels_2cluster)

    # 4-cluster analysis
    kmeans4 = KMeans(n_clusters=min(4, len(embeddings)), random_state=0, n_init="auto")
    labels_4cluster = kmeans4.fit_predict(embeddings)
    cluster4_center_idxs = cluster_center_idxs(embeddings, labels_4cluster)

    # t-SNE transformation
    perplexity = min(PERPLEXITY, len(embeddings) - 1)
    tsne = TSNE(n_components=2, random_state=0, perplexity=perplexity)
    embeddings_2d = tsne.fit_transform(embeddings)

    # Plot 2-cluster
    ax[0].set_title(f"2-cluster: {fold_title(title)}")
    scatter2 = ax[0].scatter(
        embeddings_2d[:, 0],
        embeddings_2d[:, 1],
        c=labels_2cluster,
        alpha=0.7,
        cmap='viridis'
    )
    ax[0].scatter(
        embeddings_2d[cluster2_center_idxs, 0],
        embeddings_2d[cluster2_center_idxs, 1],
        c="red",
        marker="X",
        s=100,
        edgecolors='black'
    )
    
    texts2 = []
    for idx in cluster2_center_idxs:
        code = formalizations[idx]["lean_code"][:50] + "..." if len(formalizations[idx]["lean_code"]) > 50 else formalizations[idx]["lean_code"]
        texts2.append(
            ax[0].text(embeddings_2d[idx, 0], embeddings_2d[idx, 1], code, fontsize=8),
        )
    if texts2:
        adjust_text(texts2, ax=ax[0])

    # Plot 4-cluster
    ax[1].set_title("4-cluster")
    scatter4 = ax[1].scatter(
        embeddings_2d[:, 0],
        embeddings_2d[:, 1],
        c=labels_4cluster,
        alpha=0.7,
        cmap='viridis'
    )
    ax[1].scatter(
        embeddings_2d[cluster4_center_idxs, 0],
        embeddings_2d[cluster4_center_idxs, 1],
        c="red",
        marker="X",
        s=100,
        edgecolors='black'
    )
    
    texts4 = []
    for idx in cluster4_center_idxs:
        code = formalizations[idx]["lean_code"][:50] + "..." if len(formalizations[idx]["lean_code"]) > 50 else formalizations[idx]["lean_code"]
        texts4.append(
            ax[1].text(embeddings_2d[idx, 0], embeddings_2d[idx, 1], code, fontsize=8),
        )
    if texts4:
        adjust_text(texts4, ax=ax[1])


def generate_visualization_plot(informal_statement: str, lean_codes: List[str]) -> str:
    """Generate visualization plot and return as base64 encoded image."""
    if not lean_codes:
        return ""
    
    # Create formalizations with embeddings
    formalizations = create_formalizations_with_embeddings(informal_statement, lean_codes)
    embeddings = extract_embeddings(formalizations)
    
    # Create the plot
    fig, axs = plt.subplots(1, 2, figsize=(15, 7))
    
    visualize_embeddings(
        axs,
        formalizations,
        embeddings,
        informal_statement
    )
    
    plt.tight_layout()
    
    # Convert plot to base64 string
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plot_data = buffer.getvalue()
    buffer.close()
    plt.close()
    
    # Encode to base64
    plot_base64 = base64.b64encode(plot_data).decode('utf-8')
    return plot_base64


def main() -> None:
    """Example usage."""
    informal = "The sum of two even numbers is even"
    lean_codes = [
        "theorem sum_even (a b : ℤ) (ha : Even a) (hb : Even b) : Even (a + b) := by sorry",
        "theorem even_sum (x y : ℕ) : Even x → Even y → Even (x + y) := by sorry",
        "def even_add_even (n m : ℤ) (hn : Even n) (hm : Even m) : Even (n + m) := by sorry"
    ]
    
    plot_b64 = generate_visualization_plot(informal, lean_codes)
    print(f"Generated plot with {len(plot_b64)} characters")


if __name__ == "__main__":
    main()

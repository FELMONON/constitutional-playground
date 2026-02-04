import sys
from pathlib import Path

# Ensure parent directory is in path
_parent = Path(__file__).parent.parent
sys.path.insert(0, str(_parent))

from routers.critique import router as critique_router
from routers.compare import router as compare_router
from routers.constitutions import router as constitutions_router

__all__ = ["critique_router", "compare_router", "constitutions_router"]

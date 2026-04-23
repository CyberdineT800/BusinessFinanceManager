from fastapi import APIRouter, Depends
from app.api.v1 import transactions, categories, analytics, overview, budgets, auth
from app.api.deps import verify_token

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])

_protected = APIRouter(dependencies=[Depends(verify_token)])
_protected.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
_protected.include_router(categories.router, prefix="/categories", tags=["categories"])
_protected.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
_protected.include_router(overview.router, prefix="/overview", tags=["overview"])
_protected.include_router(budgets.router, prefix="/budgets", tags=["budgets"])

router.include_router(_protected)

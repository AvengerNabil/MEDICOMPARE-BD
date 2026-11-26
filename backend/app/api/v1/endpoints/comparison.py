from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SavingsRequest(BaseModel):
    original_unit_price: float
    alternative_unit_price: float
    daily_dosage: int = 1
    duration_days: int = 30

class SavingsResponse(BaseModel):
    total_quantity: int
    original_total_cost: float
    alternative_total_cost: float
    potential_savings: float
    savings_percentage: float
    monthly_impact: float
    yearly_impact: float
    calculation_basis: str
    safety_disclaimer: str

@router.post("/savings", response_model=SavingsResponse)
def calculate_savings(payload: SavingsRequest):
    total_qty = payload.daily_dosage * payload.duration_days
    original_cost = payload.original_unit_price * total_qty
    alt_cost = payload.alternative_unit_price * total_qty
    potential_savings = max(0.0, round(original_cost - alt_cost, 2))
    
    savings_pct = 0.0
    if original_cost > 0:
        savings_pct = round((potential_savings / original_cost) * 100, 1)

    monthly_savings = max(0.0, round((payload.original_unit_price - payload.alternative_unit_price) * payload.daily_dosage * 30, 2))
    yearly_savings = round(monthly_savings * 12, 2)

    return SavingsResponse(
        total_quantity=total_qty,
        original_total_cost=round(original_cost, 2),
        alternative_total_cost=round(alt_cost, 2),
        potential_savings=potential_savings,
        savings_percentage=savings_pct,
        monthly_impact=monthly_savings,
        yearly_impact=yearly_savings,
        calculation_basis="(Original Unit Price - Alternative Unit Price) * (Daily Dosage * Days)",
        safety_disclaimer="Informational price calculation only. Do not substitute medication without consulting a registered medical practitioner."
    )

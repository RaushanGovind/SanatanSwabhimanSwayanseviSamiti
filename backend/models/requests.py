from pydantic import BaseModel
from typing import Optional

class VerifyStageRequest(BaseModel):
    remarks: Optional[str] = None
    current_stage: Optional[str] = None

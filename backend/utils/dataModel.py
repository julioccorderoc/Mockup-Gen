from pydantic import BaseModel

class MockupPayload(BaseModel):
    template: dict
    data: dict
    config: dict
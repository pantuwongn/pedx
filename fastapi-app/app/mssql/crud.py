from sqlalchemy import text
from sqlalchemy.orm import Session

def get_data(db: Session):
    rs = db.execute(text("SELECT * FROM dbo.mainapp_itemlist"))
    data = [r for r in rs]
    return data
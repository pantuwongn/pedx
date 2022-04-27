from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

MS_SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://sa:maewnarm@DESKTOP-8N46EGS\SQLEXPRESS/testdb?driver=ODBC+Driver+17+for+SQL+Server"

engine = create_engine(MS_SQLALCHEMY_DATABASE_URL)
sessionlocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)

Base = declarative_base()
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine,AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import dotenv_values

config = dotenv_values(".env")

# 
MS_SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://sa:maewnarm@DESKTOP-8N46EGS\SQLEXPRESS/testdb?driver=ODBC+Driver+17+for+SQL+Server"

ms_engine = create_engine(MS_SQLALCHEMY_DATABASE_URL)
ms_session = sessionmaker(autocommit=False,autoflush=False,bind=ms_engine)

# PostgreSQL async
PG_ASYNC_SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/testdb"

pg_async_engine = create_async_engine(PG_ASYNC_SQLALCHEMY_DATABASE_URL,echo=True)
pg_async_session = sessionmaker(pg_async_engine,expire_on_commit=False,class_=AsyncSession)

Base = declarative_base()
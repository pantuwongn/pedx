from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine,AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import dotenv_values

config = dotenv_values(".env")

MSSQL_USER = config["MSSQL_USER"]
MSSQL_PASS = config["MSSQL_PASS"]
MSSQL_SERVER = config["MSSQL_SERVER"]
MSSQL_PORT = config["MSSQL_PORT"]
MSSQL_DB = config["MSSQL_DB"]

PG_USER = config["PG_USER"]
PG_PASS = config["PG_PASS"]
PG_SERVER = config["PG_SERVER"]
PG_PORT = config["PG_PORT"]
PG_DB = config["PG_DB"]

# 
MS_SQLALCHEMY_DATABASE_URL = F"mssql+pyodbc://{MSSQL_USER}:{MSSQL_PASS}@{MSSQL_SERVER}:{MSSQL_PORT}/{MSSQL_DB}?driver=ODBC+Driver+17+for+SQL+Server"

ms_engine = create_engine(MS_SQLALCHEMY_DATABASE_URL)
ms_session = sessionmaker(autocommit=False,autoflush=False,bind=ms_engine)

# PostgreSQL async
PG_ASYNC_SQLALCHEMY_DATABASE_URL = f"postgresql+asyncpg://{PG_USER}:{PG_PASS}@{PG_SERVER}:{PG_PORT}/{PG_DB}"

pg_async_engine = create_async_engine(PG_ASYNC_SQLALCHEMY_DATABASE_URL,echo=True,pool_size=40,max_overflow=0)
pg_async_session = sessionmaker(pg_async_engine,expire_on_commit=False,class_=AsyncSession)

Base = declarative_base()
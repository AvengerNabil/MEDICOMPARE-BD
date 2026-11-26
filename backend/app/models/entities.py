import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    Table,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, unique=True, index=True)
    name_bn = Column(String(255), nullable=True)
    short_name = Column(String(100), nullable=True)
    dgda_license = Column(String(100), nullable=False, unique=True, index=True)
    established_year = Column(Integer, nullable=True)
    headquarters = Column(String(255), nullable=True)
    is_who_gmp = Column(Boolean, default=True)
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    medicines = relationship("Medicine", back_populates="manufacturer")

class Generic(Base):
    __tablename__ = "generics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inn_name = Column(String(255), nullable=False, unique=True, index=True)
    inn_name_bn = Column(String(255), nullable=True)
    therapeutic_class = Column(String(255), nullable=True, index=True)
    therapeutic_class_bn = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    medicines = relationship("Medicine", back_populates="generic")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, unique=True, index=True)
    cas_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    brand_name = Column(String(255), nullable=False, index=True)
    brand_name_bn = Column(String(255), nullable=True)
    generic_id = Column(String(36), ForeignKey("generics.id"), nullable=False, index=True)
    manufacturer_id = Column(String(36), ForeignKey("manufacturers.id"), nullable=False, index=True)
    
    strength = Column(String(100), nullable=False) # e.g. "500 mg", "20 mg"
    dosage_form = Column(String(100), nullable=False) # e.g. "Tablet", "Capsule"
    route = Column(String(100), default="Oral")
    release_mechanism = Column(String(100), default="Immediate Release")
    
    pack_size = Column(Integer, default=10)
    pack_unit = Column(String(50), default="Strip")
    unit_price = Column(Float, nullable=False) # In BDT (৳)
    mrp = Column(Float, nullable=False) # Total pack price
    price_type = Column(String(50), default="OFFICIAL_MRP")
    
    registration_number = Column(String(100), nullable=False, unique=True, index=True) # DGDA DAR Number
    verification_status = Column(String(50), default="OFFICIAL_VERIFIED") # OFFICIAL_VERIFIED, SECONDARY_VERIFIED, etc.
    is_prescription_required = Column(Boolean, default=False)
    
    data_source = Column(String(255), default="DGDA Official Price Registry")
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    generic = relationship("Generic", back_populates="medicines")
    manufacturer = relationship("Manufacturer", back_populates="medicines")
    price_records = relationship("PriceRecord", back_populates="medicine")

class PriceRecord(Base):
    __tablename__ = "price_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    medicine_id = Column(String(36), ForeignKey("medicines.id"), nullable=False, index=True)
    old_unit_price = Column(Float, nullable=False)
    new_unit_price = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    source_citation = Column(String(255), nullable=True)

    medicine = relationship("Medicine", back_populates="price_records")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action = Column(String(100), nullable=False)
    entity_name = Column(String(100), nullable=False)
    entity_id = Column(String(36), nullable=False)
    performed_by = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

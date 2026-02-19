from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./jagdamba_v4.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    role = Column(String, default="member") # super_admin, admin, family_head, member
    position = Column(String, default="none") # president, vice_president, secretary, joint_secretary, treasurer, executive_member, none
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Link to Family (if user is head or member)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    family = relationship("Family", back_populates="users", foreign_keys=[family_id])

class Election(Base):
    __tablename__ = "elections"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    status = Column(String, default="draft") # draft, active, finished, cancelled
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    posts = relationship("ElectionPost", back_populates="election")

class ElectionPost(Base):
    __tablename__ = "election_posts"
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("elections.id"))
    post_name = Column(String) # president, secretary, etc.
    seat_count = Column(Integer, default=1)
    
    election = relationship("Election", back_populates="posts")
    candidates = relationship("Candidate", back_populates="post")

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("election_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    manifesto = Column(Text, nullable=True)
    
    post = relationship("ElectionPost", back_populates="candidates")
    user = relationship("User")

class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("elections.id"))
    voter_id = Column(Integer, ForeignKey("users.id"))
    voted_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Storage for all votes in one JSON blob: [{post_id: X, candidate_id: Y}, ...]
    selections = Column(Text) 

class CommitteeHistory(Base):
    __tablename__ = "committee_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    position = Column(String)
    term_start = Column(DateTime)
    term_end = Column(DateTime, nullable=True)
    election_id = Column(Integer, ForeignKey("elections.id"), nullable=True)
    
    user = relationship("User")

class Family(Base):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    head_name = Column(String)
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # JSON storage for full form data (flexible)
    form_data = Column(Text) 
    
    # Relationships
    users = relationship("User", back_populates="family", foreign_keys=[User.family_id])
    head_user = relationship("User", foreign_keys=[user_id])
    members = relationship("Member", back_populates="family")
    assistance_requests = relationship("AssistanceRequest", back_populates="family")
    contributions = relationship("Contribution", back_populates="family")

class Member(Base):
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"))
    full_name = Column(String)
    relation = Column(String) # Head, Spouse, Son, etc.
    age = Column(Integer, nullable=True)
    occupation = Column(String, nullable=True)
    
    family = relationship("Family", back_populates="members")

class AssistanceRequest(Base):
    __tablename__ = "assistance_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"))
    request_type = Column(String) # Medical, Education, etc.
    amount_requested = Column(Float)
    description = Column(Text)
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    family = relationship("Family", back_populates="assistance_requests")

class Contribution(Base):
    __tablename__ = "contributions"
    
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"))
    amount = Column(Float)
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)
    payment_type = Column(String) # Monthly, Donation, etc.
    status = Column(String, default="Completed")
    
    family = relationship("Family", back_populates="contributions")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String) # Medical Help, Emergency Help, Event, etc.
    amount = Column(Float)
    description = Column(Text)
    status = Column(String, default="Pending") # Pending, Approved
    date = Column(DateTime, default=datetime.datetime.utcnow)
    added_by = Column(Integer, ForeignKey("users.id"))
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    user = relationship("User", foreign_keys=[added_by])
    approver = relationship("User", foreign_keys=[approved_by])

class Notice(Base):
    __tablename__ = "notices"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    category = Column(String, default="General") # Meeting, Reminder, Disaster, Emergency, general
    priority = Column(String, default="normal") # normal, urgent, emergency
    audience = Column(String, default="all") # all, admin, family_head
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Rule(Base):
    __tablename__ = "rules"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # CREATE, UPDATE, APPROVE, DELETE
    target_type = Column(String) # Expense, Contribution, Family, Request
    target_id = Column(Integer) # ID of the target record
    details = Column(Text) # JSON or descriptive text
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User") # Who performed the action

class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Strike(Base):
    __tablename__ = "strikes"
    id = Column(Integer, primary_key=True, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"))
    initiator_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(Text)
    status = Column(String, default="petition") # petition, voting, passed, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    voting_start_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime) # For petition phase or voting phase end
    
    target_user = relationship("User", foreign_keys=[target_user_id])
    initiator = relationship("User", foreign_keys=[initiator_id])
    interactions = relationship("StrikeInteraction", back_populates="strike")

class StrikeInteraction(Base):
    __tablename__ = "strike_interactions"
    id = Column(Integer, primary_key=True, index=True)
    strike_id = Column(Integer, ForeignKey("strikes.id"))
    voter_id = Column(Integer, ForeignKey("users.id"))
    is_vote = Column(Boolean, default=False) # False = Petition Support, True = Final Vote
    choice = Column(Boolean, nullable=True) # True = Yes (Remove), False = No (Keep)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    strike = relationship("Strike", back_populates="interactions")
    voter = relationship("User")

class PerformanceRating(Base):
    __tablename__ = "performance_ratings"
    id = Column(Integer, primary_key=True, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"))
    rater_id = Column(Integer, ForeignKey("users.id"))
    stars = Column(Integer) # 1-5
    feedback = Column(Text, nullable=True)
    term_year = Column(Integer) # E.g. 2026
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    target_user = relationship("User", foreign_keys=[target_user_id])
    rater = relationship("User", foreign_keys=[rater_id])

# Create tables
def init_db():

    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

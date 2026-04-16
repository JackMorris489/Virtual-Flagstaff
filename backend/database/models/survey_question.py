# survey_question.py

from sqlmodel import SQLModel, Field, Column, ARRAY, String

class SurveyQuestionBase(SQLModel):
    pass

class SurveyQuestion(SurveyQuestionBase, table=True):
    __tablename__ = "surveyquestions"

    id: int | None = Field(default=None, primary_key=True)
    question: str
    input: str
    options: list[str] | None = Field(sa_column=Column(ARRAY(String)))

class SurveyQuestionCreate(SurveyQuestionBase):
    question: str
    input: str
    options: list[str] | None = None

class SurveyQuestionPublic(SurveyQuestionBase):
    id: int
    question: str
    input: str
    options: list[str] | None

class SurveryQuestionUpdate(SurveyQuestionBase):
    question: str | None = None
    input: str | None = None
    options: list[str] | None = None
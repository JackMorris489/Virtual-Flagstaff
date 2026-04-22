# survey_questions.py

from fastapi import APIRouter, HTTPException
from database.models import (
    SurveyQuestion, 
    SurveyQuestionPublic, 
    SurveryQuestionUpdate, 
    SurveyQuestionCreate
)
from database.database_service import SessionDep, database_service
from sqlmodel import select

survey_questions_router = APIRouter(prefix="/survey-questions", tags=["Survey Questions"])

@survey_questions_router.post("", response_model=SurveyQuestionPublic)
def create_survey_question(
    session: SessionDep, 
    survey_question: SurveyQuestionCreate
) -> SurveyQuestionPublic:
    query = select(SurveyQuestion).where(
        SurveyQuestion.question == survey_question.question,
        SurveyQuestion.input == survey_question.input,
        SurveyQuestion.options== survey_question.options,
    )
    existing = database_service.get_query_result(session, query)

    if existing:
        raise HTTPException(409, "Survey question exists")

    else:
        return database_service.create_model_instance(SurveyQuestion, session, survey_question)


@survey_questions_router.get("", response_model=list[SurveyQuestionPublic])
def get_survey_questions(session: SessionDep) -> list[SurveyQuestionPublic]:
    return database_service.get_model_instances(SurveyQuestion, session)


@survey_questions_router.put("/{id}", response_model=SurveyQuestionPublic)
def update_survey_question(id: int, survey_question: SurveryQuestionUpdate, session: SessionDep):
    return database_service.set_model_instance_by_id(SurveyQuestion, session, id, survey_question)


@survey_questions_router.delete("/{id}")
def delete_survey_question(id: int, session: SessionDep):
    return database_service.delete_model_instance(SurveyQuestion, session, id)
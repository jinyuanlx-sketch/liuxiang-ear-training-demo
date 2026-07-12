import type { EarTrainingQuestion, SightSingingQuestion } from "@/types/question-bank";
import type { Assignment } from "@/types/assignment";
import { earTrainingQuestions, sightSingingQuestions } from "@/lib/mock-data";

export function getSightSingingQuestionById(id: string) {
  return sightSingingQuestions.find((question) => question.id === id);
}

export function getEarTrainingQuestionById(id: string) {
  return earTrainingQuestions.find((question) => question.id === id);
}

export function getQuestionForAssignment(assignment: Assignment) {
  if (!assignment.questionId) {
    return null;
  }

  if (assignment.module === "sight_singing") {
    return getSightSingingQuestionById(assignment.questionId);
  }

  if (assignment.module === "ear_training") {
    return getEarTrainingQuestionById(assignment.questionId);
  }

  return null;
}

export function getApprovedSightSingingQuestions() {
  return sightSingingQuestions.filter((question) => question.reviewStatus === "approved");
}

export function getApprovedEarTrainingQuestions() {
  return earTrainingQuestions.filter((question) => question.reviewStatus === "approved");
}

export function sightQuestionToLegacyTargetData(question: SightSingingQuestion) {
  return {
    key: question.keySignature,
    meter: question.timeSignature,
    tempo: question.tempo,
    difficultyLabel: `Level ${question.level}`,
    trainingGoal: question.trainingGoal,
    teacherInstruction:
      question.teacherStyleNotes ?? "先默唱主音和关键跳进，再开始录音。",
    targetPitches: question.targetPitchJson,
    rhythmPattern: question.targetRhythmJson,
    scoreUrl: question.scoreImageUrl ?? question.pdfUrl ?? null
  };
}

export function getEarQuestionAnswer(question: EarTrainingQuestion) {
  return question.answerKeyJson.correctAnswer;
}

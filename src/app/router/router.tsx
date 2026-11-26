import { lazy, Suspense, type ComponentType } from 'react'
import { LoadingState } from '@/components/feedback/LoadingState'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/layouts/AppShell'
import { StudentShell } from '@/app/layouts/StudentShell'
import { TrainerShell } from '@/app/layouts/TrainerShell'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { ROUTES } from './routes'

/**
 * Cada tela (fora login/senha) vira um pedaço próprio do bundle, baixado só quando a pessoa abre a
 * rota: o aluno não carrega o construtor de treino do personal, nem a avaliação postural (MediaPipe).
 */
function lazyPage<M, P extends object>(load: () => Promise<M>, pick: (module: M) => ComponentType<P>) {
  const Page = lazy(() => load().then((module) => ({ default: pick(module) })))
  return function LazyPage(props: P) {
    return (
      <Suspense fallback={<LoadingState />}>
        <Page {...props} />
      </Suspense>
    )
  }
}

const StudentAccountPage = lazyPage(() => import('@/features/auth/pages/StudentAccountPage'), (m) => m.StudentAccountPage)
const PersonalDashboardPage = lazyPage(() => import('@/features/dashboard/pages/PersonalDashboardPage'), (m) => m.PersonalDashboardPage)
const StudentHomePage = lazyPage(() => import('@/features/dashboard/pages/StudentHomePage'), (m) => m.StudentHomePage)
const NewPhysicalAssessmentPage = lazyPage(() => import('@/features/assessments/physical/pages/NewPhysicalAssessmentPage'), (m) => m.NewPhysicalAssessmentPage)
const StudentAssessmentsPage = lazyPage(() => import('@/features/assessments/physical/pages/StudentAssessmentsPage'), (m) => m.StudentAssessmentsPage)
const StudentMyAssessmentsPage = lazyPage(() => import('@/features/assessments/physical/pages/StudentMyAssessmentsPage'), (m) => m.StudentMyAssessmentsPage)
const StudentAssessmentDetailPage = lazyPage(() => import('@/features/assessments/physical/pages/StudentAssessmentDetailPage'), (m) => m.StudentAssessmentDetailPage)
const StudentAnamnesisListPage = lazyPage(() => import('@/features/anamnesis/pages/StudentAnamnesisListPage'), (m) => m.StudentAnamnesisListPage)
const TrainerAnamnesisPage = lazyPage(() => import('@/features/anamnesis/pages/TrainerAnamnesisPage'), (m) => m.TrainerAnamnesisPage)
const StudentAnamnesisFillPage = lazyPage(() => import('@/features/anamnesis/pages/StudentMyAnamnesisPage'), (m) => m.StudentAnamnesisFillPage)
const StudentMyAnamnesisPage = lazyPage(() => import('@/features/anamnesis/pages/StudentMyAnamnesisPage'), (m) => m.StudentMyAnamnesisPage)
const StudentsListPage = lazyPage(() => import('@/features/students/pages/StudentsListPage'), (m) => m.StudentsListPage)
const StudentDetailPage = lazyPage(() => import('@/features/students/pages/StudentDetailPage'), (m) => m.StudentDetailPage)
const StudentWorkoutsPage = lazyPage(() => import('@/features/workouts/pages/StudentWorkoutsPage'), (m) => m.StudentWorkoutsPage)
const WorkoutDetailPage = lazyPage(() => import('@/features/workouts/pages/WorkoutDetailPage'), (m) => m.WorkoutDetailPage)
const ExerciseDetailPage = lazyPage(() => import('@/features/workouts/pages/ExerciseDetailPage'), (m) => m.ExerciseDetailPage)
const PosturalCorrectionPage = lazyPage(() => import('@/features/workouts/pages/PosturalCorrectionPage'), (m) => m.PosturalCorrectionPage)
const ExerciseLibraryPage = lazyPage(() => import('@/features/workouts/pages/ExerciseLibraryPage'), (m) => m.ExerciseLibraryPage)
const WorkoutBuilderPage = lazyPage(() => import('@/features/workouts/pages/WorkoutBuilderPage'), (m) => m.WorkoutBuilderPage)
const NutritionPlanPage = lazyPage(() => import('@/features/nutrition/pages/NutritionPlanPage'), (m) => m.NutritionPlanPage)
const BillingPage = lazyPage(() => import('@/features/billing/pages/BillingPage'), (m) => m.BillingPage)
const ChatPage = lazyPage(() => import('@/features/chat/pages/ChatPage'), (m) => m.ChatPage)
const TrainerSchedulePage = lazyPage(() => import('@/features/schedule/pages/TrainerSchedulePage'), (m) => m.TrainerSchedulePage)
const TrainerInboxPage = lazyPage(() => import('@/features/chat/pages/TrainerInboxPage'), (m) => m.TrainerInboxPage)

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ROUTES.login} replace /> },
  {
    element: <AppShell />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
      { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <StudentShell />,
    children: [
      { path: ROUTES.student.home, element: <StudentHomePage /> },
      { path: ROUTES.student.workouts, element: <StudentWorkoutsPage /> },
      { path: ROUTES.student.workoutDetail, element: <WorkoutDetailPage /> },
      { path: ROUTES.student.exerciseDetail, element: <ExerciseDetailPage /> },
      { path: ROUTES.student.nutrition, element: <NutritionPlanPage /> },
      { path: ROUTES.student.posturalCorrection, element: <PosturalCorrectionPage /> },
      { path: ROUTES.student.myAssessments, element: <StudentMyAssessmentsPage /> },
      { path: ROUTES.student.assessmentDetail, element: <StudentAssessmentDetailPage /> },
      { path: ROUTES.student.anamnesis, element: <StudentMyAnamnesisPage /> },
      { path: ROUTES.student.anamnesisDetail, element: <StudentAnamnesisFillPage /> },
      {
        path: ROUTES.student.chat,
        element: <ChatPage selfRole="student" counterpartName="Trainer Wood" />,
      },
      { path: ROUTES.student.billing, element: <BillingPage /> },
      { path: ROUTES.student.account, element: <StudentAccountPage /> },
    ],
  },
  {
    // Shell próprio do personal: ele carrega o badge global de não lidas (ver TrainerShell).
    element: <TrainerShell />,
    children: [
      { path: ROUTES.trainer.dashboard, element: <PersonalDashboardPage /> },
      { path: ROUTES.trainer.students, element: <StudentsListPage /> },
      { path: ROUTES.trainer.studentDetail, element: <StudentDetailPage /> },
      { path: ROUTES.trainer.studentAssessments, element: <StudentAssessmentsPage /> },
      { path: ROUTES.trainer.newAssessment, element: <NewPhysicalAssessmentPage /> },
      { path: ROUTES.trainer.viewAssessment, element: <NewPhysicalAssessmentPage /> },
      { path: ROUTES.trainer.studentAnamnesis, element: <StudentAnamnesisListPage /> },
      { path: ROUTES.trainer.anamnesisDetail, element: <TrainerAnamnesisPage /> },
      { path: ROUTES.trainer.library, element: <ExerciseLibraryPage /> },
      { path: ROUTES.trainer.newWorkout, element: <WorkoutBuilderPage /> },
      { path: ROUTES.trainer.studentWorkoutBuilder, element: <WorkoutBuilderPage /> },
      { path: ROUTES.trainer.chat, element: <TrainerInboxPage /> },
      { path: ROUTES.trainer.schedule, element: <TrainerSchedulePage /> },
      { path: ROUTES.trainer.account, element: <StudentAccountPage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.login} replace /> },
])

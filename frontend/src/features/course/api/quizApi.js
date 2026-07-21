import axiosClient from '../../../api/axios';

export const quizApi = {
    getMyQuizzes: () => {
        return axiosClient.get('/api/v1/quizzes/my-quizzes');
    },

    getQuizById: (quizId) => {
        return axiosClient.get(`/api/v1/quizzes/${quizId}`);
    },

    createQuiz: (quizData) => {
        return axiosClient.post('/api/v1/quizzes', quizData);
    },

    updateQuiz: (quizId, quizData) => {
        return axiosClient.put(`/api/v1/quizzes/${quizId}`, quizData);
    },

    deleteQuiz: (quizId) => {
        return axiosClient.delete(`/api/v1/quizzes/${quizId}`);
    }
};

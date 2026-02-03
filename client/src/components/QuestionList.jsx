import React from 'react'
import QuestionItem from './QuestionItem'

/**
 * Компонент списка вопросов
 * @param {Array} questions - Массив вопросов для отображения
 * @param {Function} onEdit - Функция для редактирования вопроса
 * @param {Function} onDelete - Функция для удаления вопроса
 */
function QuestionList({ questions, onEdit, onDelete }) {
  // Отображаем сообщение, если вопросы не найдены
  if (questions.length === 0) {
    return <div className="no-questions">Вопросы не найдены</div>
  }

  return (
    <div className="question-list">
      <div className="question-items">
        {questions.map(question => (
          <div key={question.id} className="question-item-wrapper">
            <QuestionItem
              question={question}
              onEdit={onEdit}
              onDelete={() => onDelete(question.id, question.question)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuestionList
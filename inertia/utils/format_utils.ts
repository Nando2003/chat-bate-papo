export const formatTime = (dateString: string): string => {
  const messageDate = new Date(dateString)

  const now = new Date()
  const isToday = messageDate.toDateString() === now.toDateString()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = messageDate.toDateString() === yesterday.toDateString()

  if (isToday) {
    return messageDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } else if (isYesterday) {
    return `Yesterday ${messageDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  return messageDate.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

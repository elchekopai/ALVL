import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackContext

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Получение токена из переменной окружения или использование токена прямо в коде
TOKEN = "7364282996:AAH1FtecWC3_L4p8pnoKyRpG-ww-itz4cIo"


# Обработчик команды /start
async def start(update: Update, context: CallbackContext):
    keyboard = [[InlineKeyboardButton("Open Mini App", url="http://t.me/SpotifyLevelBot/SpotifyLVL")]]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        text="Click the button below to open the mini app:",
        reply_markup=reply_markup
    )


# Основная функция для запуска бота
def main():
    # Создание экземпляра приложения
    application = ApplicationBuilder().token(TOKEN).build()

    # Добавление обработчика команды /start
    application.add_handler(CommandHandler("start", start))

    # Запуск бота
    application.run_polling()


if __name__ == "__main__":
    main()
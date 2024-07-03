from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Updater, CommandHandler, CallbackContext


# Функция для отправки сообщения с кнопкой
def start(update: Update, context: CallbackContext) -> None:
    keyboard = [
        [InlineKeyboardButton("Перейти на сайт", url="https://uplvl-2166e11a64c2.herokuapp.com/")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    update.message.reply_text('Нажмите кнопку ниже, чтобы перейти на сайт:', reply_markup=reply_markup)


def main():
    # Ваш токен
    updater = Updater("7364282996:AAH1FtecWC3_L4p8pnoKyRpG-ww-itz4cIo")

    dispatcher = updater.dispatcher

    # Обработчик команды /start
    dispatcher.add_handler(CommandHandler("start", start))

    updater.start_polling()
    updater.idle()


if __name__ == '__main__':
    main()
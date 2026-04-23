from aiogram.fsm.state import State, StatesGroup


class TransactionFSM(StatesGroup):
    awaiting_category = State()
    awaiting_amount = State()
    awaiting_correction_field = State()
    awaiting_correction_value = State()

from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    @abstractmethod
    def process_payment(self, amount):
        pass

class CreditCardPayment(PaymentProcessor):
    def process_payment(self, amount):
        print(f"Processing credit card payment of ${amount}")

class DebitCardPayment(PaymentProcessor):
    def process_payment(self, amount):
        print(f"Processing debit card payment of ${amount}")

class UPIPayment(PaymentProcessor):
    def process_payment(self, amount):
        print(f"Processing UPI payment of ${amount}")

class NetBankingPayment(PaymentProcessor):
    def process_payment(self, amount):
        print(f"Processing net banking payment of ${amount}")

class PaymentService:
    def __init__(self, payment_processor):
        self.payment_processor = payment_processor
    
    def make_payment(self, amount):
        self.payment_processor.process_payment(amount)

if __name__ == "__main__":
    credit_card_service = PaymentService(CreditCardPayment())
    credit_card_service.make_payment(1000.0)
    
    debit_card_service = PaymentService(DebitCardPayment())
    debit_card_service.make_payment(500.0)
    
    upi_service = PaymentService(UPIPayment())
    upi_service.make_payment(250.0)
    
    net_banking_service = PaymentService(NetBankingPayment())
    net_banking_service.make_payment(750.0)

/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js";
import {ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

const bill = {
    "type": "Hôtel et logement",
    "name": "encore",
    "amount": 400,
    "date": "2004-04-04",
    "vat": "80",
    "pct": 20,
    "commentary": "séminaire billed",
    "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
    "fileName": "preview-facture-free-201801-pdf-1.jpg",
    "status": "pending",
}
describe("Given I am connected as an employee", () => {
    let NewBillfn;
    beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        document.body.innerHTML = NewBillUI()

        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: 'employee@test.tld'
        }))
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({pathname})
        }

        const store = mockStore

        NewBillfn = new NewBill({document, onNavigate, store, localStorage: localStorageMock})

    })
    describe("When I am on NewBill Page and I add a picture with a wrong extension", () => {
        test("Then, It should prevent the form to submit.", () => {
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
            });
            const event = {
                preventDefault: jest.fn(),
                target: {
                    files: [
                        {
                            name: 'document.txt',
                            size: 50000,
                            type: 'text/plain',
                        },
                    ],
                    value: 'path/to/document.txt',
                },
            };

            NewBillfn.handleChangeFile(event);
            expect(consoleErrorMock).toHaveBeenCalled();
        })
    })
    describe("When I am on NewBill Page and I add a picture with the right extension", () => {
        test("Then, It should add the picture to the form.", () => {
            const handleChangeFile = jest.spyOn(NewBillfn, "handleChangeFile");

            const event = {
                preventDefault: jest.fn(),
                target: {
                    files: [
                        {
                            name: 'image.png',
                            size: 50000,
                            type: 'image/png',
                        },
                    ],
                    value: 'path/to/image.png',
                },
            };

            NewBillfn.handleChangeFile(event);

            expect(handleChangeFile).toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();

        })
    })
    describe("When I am on NewBill Page and I submit a new Bill", () => {
        test("Then, I should create a new Bill.", async () => {

            document.querySelector(`select[data-testid="expense-type"]`).value = bill["type"]
            document.querySelector(`input[data-testid="expense-name"]`).value = bill["name"]
            document.querySelector(`input[data-testid="amount"]`).value = parseInt(bill["amount"])
            document.querySelector(`input[data-testid="datepicker"]`).value = bill["date"]
            document.querySelector(`input[data-testid="vat"]`).value = bill["vat"]
            document.querySelector(`input[data-testid="pct"]`).value = parseInt(bill["pct"])
            document.querySelector(`textarea[data-testid="commentary"]`).value = bill["commentary"]

            NewBillfn.fileUrl = bill["fileUrl"]
            NewBillfn.fileName = bill["fileName"]
            const submitBtn = screen.getByTestId('btn-send-bill')
            jest.spyOn(NewBillfn, "handleSubmit")
            jest.spyOn(NewBillfn, "updateBill")
            fireEvent.click(submitBtn);
            expect(NewBillfn.updateBill).toHaveBeenCalled()
        })
    })
})


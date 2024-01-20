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

            const fakeEvent = {
                preventDefault: jest.fn(),
                target: {
                    querySelector: jest.fn().mockImplementation(selector => {
                        if (selector === 'select[data-testid="expense-type"]') {
                            return {value: bill["type"]}; // Adjust the value as needed
                        }
                        if (selector === 'input[data-testid="expense-name"]') {
                            return {value: bill["name"]}; // Adjust the value as needed
                        }
                        if (selector === 'input[data-testid="amount"]') {
                            return {value: parseInt(bill["amount"])}; // Adjust the value as needed
                        }
                        if (selector === 'input[data-testid="datepicker"]') {
                            return {value: bill["date"]}; // Adjust the value as needed
                        }
                        if (selector === 'input[data-testid="vat"]') {
                            return {value: bill["vat"]}; // Adjust the value as needed
                        }
                        if (selector === 'input[data-testid="pct"]') {
                            return {value: parseInt(bill["pct"])}; // Adjust the value as needed
                        }
                        if (selector === 'textarea[data-testid="commentary"]') {
                            return {value: bill["commentary"]}; // Adjust the value as needed
                        }
                    }),
                },
            };
            NewBillfn.fileUrl = bill["fileUrl"]
            NewBillfn.fileName = bill["fileName"]

            const submitBtn = screen.getByTestId('btn-send-bill')

            const handleSubmit = jest.fn(() => NewBillfn.handleSubmit(fakeEvent))
            submitBtn.addEventListener("click", handleSubmit)
            fireEvent.click(submitBtn)
            expect(handleSubmit).toHaveBeenCalled()
        })
    })
})


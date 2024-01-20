/**
 * @jest-environment jsdom
 */
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then the bills should be displayed", () => {
        })
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            const isHighlighted = windowIcon.classList.contains("active-icon")
            expect(isHighlighted).toBeTruthy()
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })
    describe("When an error occurs on API", () => {
        beforeEach(() => {
            jest.spyOn(mockStore, "bills")
            Object.defineProperty(
                window,
                'localStorage',
                {value: localStorageMock}
            )
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee',
                email: "a@a"
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"))
                    }
                }
            })
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
        })

        test("fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 500"))
                    }
                }
            })

            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
        })
    })
})
describe("Given I am connected as an employee and I am on the Bills page", () => {
    describe("When I click on the new bill button", () => {
        test("Then It should redirect to the new Bill View", () => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname})
            }

            const store = null;
            const billsFn = new Bills({document, onNavigate, store, localStorage: localStorageMock})
            const btn = screen.getByTestId("btn-new-bill");

            jest.spyOn(billsFn, 'handleClickNewBill');
            fireEvent.click(btn);

            const onscreen = screen.getByText('Envoyer une note de frais');
            expect(onscreen).toBeTruthy();
        })

    })
    describe("When I click on the eye icon", () => {
        test("Then a modal should open", async () => {
            $.fn.modal = jest.fn();
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))

            const data = []
            data.push(bills[0])
            document.body.innerHTML = BillsUI({data: data})
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname})
            }

            const store = null;
            const billsFn = new Bills({document, onNavigate, store, localStorage: localStorageMock})

            const eye = screen.getByTestId('icon-eye')
            jest.spyOn(billsFn, 'handleClickIconEye');
            fireEvent.click(eye);
            await waitFor(() => {
                expect(billsFn.handleClickIconEye).toHaveBeenCalled();
            });

            const modale = screen.getByTestId('modaleFileEmployee')
            expect(modale).toBeTruthy()
        })
    })
})

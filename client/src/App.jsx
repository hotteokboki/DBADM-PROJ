import { Main, Navigator, Sidebar } from "./layout/index"
import { useGlobalContext } from "./context/context"
import Snackbar from "./components/Snackbar";

function App() {
  const { state } = useGlobalContext()

  return (
    <div className="App">
      <Navigator />
      <Sidebar isShowing={state.showSidebar} />
      <Main />
      <Snackbar />
    </div>
  )
}

export default App
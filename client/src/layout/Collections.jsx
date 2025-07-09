import styled from "styled-components"

export default function Collections() {
  return (
    <Grid>
      <h1>Collections</h1>
    </Grid>
  )
}

const Grid = styled.section`
  max-width: 111rem;
  margin: 4rem auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;

  h1 {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }
`


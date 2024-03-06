import SearchBox from '../components/SearchBox';

const PlaygroundPage = () => {
    return <SearchBox onChange={(text: string) => console.log({ text })} />;
};

export default PlaygroundPage;

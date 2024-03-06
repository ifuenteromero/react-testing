import ExpandableText from '../components/ExpandableText';

const PlaygroundPage = () => {
    const shortText = 'short text';
    const longText =
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo deserunt accusantium fugiat? Incidunt rem reprehenderit dolorem, quod illo est eos, maxime provident quis laboriosam modi praesentium illum dignissimos, corporis tempore eveniet impedit minus quos odit quidem asperiores? Voluptas labore quod ad, adipisci veritatis odit illum, ut aut reprehenderit sequi quam eligendi soluta voluptatum quo autem accusamus magnam minus magni, sit animi. Culpa dicta expedita repellat dolore, at ipsa molestias provident accusantium quo minima deserunt. Voluptates, voluptas quisquam vitae iste mollitia tempore ducimus iusto? Pariatur at enim a qui? Ullam sed vero sit pariatur quas quo molestiae. Beatae laborum commodi vero.';
    return <ExpandableText text={longText} />;
};

export default PlaygroundPage;

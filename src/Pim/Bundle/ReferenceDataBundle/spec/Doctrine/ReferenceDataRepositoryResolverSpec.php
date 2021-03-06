<?php

namespace spec\Pim\Bundle\ReferenceDataBundle\Doctrine;

use Acme\Bundle\AppBundle\Entity\Color;
use Pim\Bundle\ReferenceDataBundle\Doctrine\ReferenceDataRepositoryResolver;
use Doctrine\Common\Persistence\ObjectRepository;
use PhpSpec\ObjectBehavior;
use Pim\Component\ReferenceData\ConfigurationRegistryInterface;
use Pim\Component\ReferenceData\Model\ConfigurationInterface;
use Symfony\Bridge\Doctrine\RegistryInterface;

class ReferenceDataRepositoryResolverSpec extends ObjectBehavior
{
    function let(ConfigurationRegistryInterface $configurationRegistry, RegistryInterface $doctrine)
    {
        $this->beConstructedWith($configurationRegistry, $doctrine);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(ReferenceDataRepositoryResolver::class);
    }

    function it_resolves_the_repository_of_a_reference_data(
        $configurationRegistry,
        $doctrine,
        ConfigurationInterface $configuration,
        ObjectRepository $repository
    ) {
        $configuration->getClass()->willReturn(Color::class);
        $configurationRegistry->get('colors')->willReturn($configuration);
        $doctrine->getRepository(Color::class)->willReturn($repository);

        $this->resolve('colors')->shouldReturn($repository);
    }
}
